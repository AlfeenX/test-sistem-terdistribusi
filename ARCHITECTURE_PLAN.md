# Gajayana Sport Center – Event-Driven Architecture Plan

## Stack
- **Runtime:** Node.js + TypeScript
- **API:** Express
- **Message broker:** RabbitMQ
- **ORM:** Prisma
- **Databases:** PostgreSQL (one per service)
- **Package manager:** pnpm (monorepo)
- **Orchestration:** Docker Compose

---

## Services Overview

| Service              | Port | Database   | Role                                      |
|----------------------|------|------------|-------------------------------------------|
| api-gateway          | 3000 | —          | Route requests to services, no DB         |
| user-service         | 3001 | users_db   | Users, roles, memberships                 |
| field-service        | 3002 | fields_db  | Facilities, slots, availability           |
| booking-service      | 3003 | bookings_db| Bookings, status history                  |
| payment-service      | 3004 | payments_db| Payments, invoices                        |
| notification-service | 3005 | notifications_db | Notification log (idempotency/delivery) |

---

## Event Flow (RabbitMQ)

- **Exchanges:** one topic exchange per domain (e.g. `user.events`, `field.events`, `booking.events`, `payment.events`).
- **Routing keys:** `entity.action` (e.g. `user.created`, `booking.confirmed`).

### Publishers → Events

| Service         | Events published                                                                 |
|-----------------|-----------------------------------------------------------------------------------|
| user-service    | `user.created`, `user.updated`, `membership.changed`                             |
| field-service   | `field.created`, `slot.booked`, `slot.released`                                  |
| booking-service | `booking.created`, `booking.confirmed`, `booking.cancelled`                      |
| payment-service | `payment.completed`, `payment.failed`                                            |

### Subscribers (consumers)

| Service              | Subscribes to                                                                 | Action |
|----------------------|-------------------------------------------------------------------------------|--------|
| booking-service      | `user.created`                                                                | Sync user id refs if needed |
| booking-service      | `slot.booked`, `slot.released`                                                | Update availability view |
| payment-service      | `booking.confirmed`                                                           | Create invoice / payment intent |
| notification-service | `user.created`, `booking.created`, `booking.confirmed`, `payment.completed`   | Send email/SMS / log |

---

## Database Design (3NF + Indexing & Query Optimization)

### 1. user-service – `users_db`

**Normalization (3NF):**
- **roles** – id, name (no repeated role names).
- **users** – id, email, phone, full_name, role_id (FK), created_at, updated_at. No transitive dependencies.
- **membership_plans** – id, name, duration_days, price. Plan attributes in one table.
- **user_memberships** – id, user_id (FK), plan_id (FK), started_at, expires_at, status. Only FKs and scalar attributes.

**Indexes / optimization:**
- `users(email)` UNIQUE, `users(phone)` for login/lookup.
- `users(role_id)` for role-based queries.
- `user_memberships(user_id)`, `user_memberships(expires_at)`, `user_memberships(status)` for “active membership” and listing.

---

### 2. field-service – `fields_db`

**Normalization (3NF):**
- **facility_types** – id, name (e.g. badminton, futsal).
- **facilities** – id, name, facility_type_id (FK), hourly_rate, created_at. No transitive deps.
- **slots** – id, facility_id (FK), slot_date, start_time, end_time, status (available | reserved | booked). Slots are independent entities.
- **slot_reservations** – id, slot_id (FK), reserved_until (for temporary hold). Optional; can be merged into `slots` with status if preferred.

**Indexes / optimization:**
- `facilities(facility_type_id)` for filtering by type.
- `slots(facility_id, slot_date)`, `slots(slot_date, status)` for “available slots by date” and “slots by facility”.
- Composite index `(facility_id, slot_date, start_time)` for unique slot and range queries.

---

### 3. booking-service – `bookings_db`

**Normalization (3NF):**
- **bookings** – id, user_id (external from user-service), facility_id (external), slot_id (external), booking_date, start_time, end_time, total_amount, status (pending | confirmed | cancelled), created_at. Only IDs and scalars.
- **booking_status_history** – id, booking_id (FK), from_status, to_status, changed_at. Audit trail.

**Indexes / optimization:**
- `bookings(user_id)`, `bookings(slot_id)` for “my bookings” and “bookings for slot”.
- `bookings(booking_date, status)`, `bookings(status)` for listing and reporting.
- `booking_status_history(booking_id)` for history per booking.

---

### 4. payment-service – `payments_db`

**Normalization (3NF):**
- **payment_methods** – id, name (e.g. bank_transfer, e_wallet).
- **invoices** – id, booking_id (external), user_id (external), amount, status (pending | paid | failed), due_at, created_at.
- **payments** – id, invoice_id (FK), payment_method_id (FK), amount, reference_number, status, paid_at, created_at.

**Indexes / optimization:**
- `invoices(booking_id)` UNIQUE (one invoice per booking), `invoices(user_id)`, `invoices(status)`.
- `payments(invoice_id)`, `payments(reference_number)` UNIQUE, `payments(paid_at)` for reconciliation.

---

### 5. notification-service – `notifications_db`

**Minimal (3NF):**
- **notification_log** – id, event_type, payload_hash (for idempotency), user_id (optional), sent_at, channel (email | sms). Prevents duplicate sends.

**Indexes:** `(event_type, payload_hash)` UNIQUE for idempotency; `user_id`, `sent_at` for listing.

---

## Query Optimization Summary

- All FKs and frequently filtered columns have indexes.
- Composite indexes for common access patterns (e.g. slot by facility + date, bookings by user + date).
- Unique indexes where business rules require uniqueness (email, booking_id for invoice, reference_number).
- Prisma: use `select`/`include` only for needed fields; avoid N+1 with proper `include` or batch reads.

---

## Folder Structure (Final)

```
apps/
  api-gateway/       # Express, proxy to services, no DB
  user-service/      # Express + Prisma + users_db
  field-service/     # Express + Prisma + fields_db
  booking-service/   # Express + Prisma + bookings_db (NEW)
  payment-service/   # Express + Prisma + payments_db (NEW)
  notification-service/  # Express + subscribers + notifications_db (NEW)
packages/
  shared/
    events/          # Event type definitions, routing keys
    broker/          # RabbitMQ connect, publish, subscribe
    utils/           # Logging, errors, id helpers
infrastructure/
  rabbitmq/          # Optional config
docker-compose.yml   # rabbitmq, postgres x5 (or 6), all app services
```

---

## Execution Order

1. Root: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`, `.env.example`.
2. **packages/shared:** events, broker, utils (TypeScript).
3. **user-service:** Prisma schema (3NF + indexes), Express server, publishers/subscribers.
4. **field-service:** Prisma schema (3NF + indexes), Express server, publishers/subscribers.
5. **booking-service:** New app + Prisma + Express + subscribers/publishers.
6. **payment-service:** New app + Prisma + Express + subscribers/publishers.
7. **notification-service:** New app + optional Prisma + subscribers only.
8. **api-gateway:** Express, proxy routes to each service.
9. **Docker Compose:** RabbitMQ, 6 PostgreSQL instances, 6 Node services.

---

If this plan looks good, implementation will follow in the order above using **pnpm**, **TypeScript**, **Express**, **Prisma**, **RabbitMQ**, and **Docker Compose**.
