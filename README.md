# Gajayana Sport Center – Event-Driven Architecture

Monorepo with **TypeScript**, **Node.js**, **Express**, **RabbitMQ**, **Prisma**, **PostgreSQL**, and **Docker Compose**. Package manager: **pnpm**.

## Services

| Service              | Port | Database         | Description                    |
|----------------------|------|------------------|--------------------------------|
| api-gateway          | 3000 | —                | Proxies to all services        |
| user-service         | 3001 | users_db         | Users, roles, memberships      |
| field-service        | 3002 | fields_db        | Facilities, slots              |
| booking-service      | 3003 | bookings_db      | Bookings                       |
| payment-service      | 3004 | payments_db      | Invoices, payments             |
| notification-service | 3005 | notifications_db | Event-driven notifications    |

## Prerequisites

- Node.js 18+
- pnpm 9+
- Docker & Docker Compose (for full stack)
- PostgreSQL 16 (if running services locally without Docker)

## Quick start (Docker)

```bash
# Start infrastructure + all services
pnpm docker:up

# Apply DB schemas and seed (run once after DBs are up)
# From project root, with containers running:
pnpm --filter @gajayana/user-service exec prisma db push
pnpm --filter @gajayana/user-service exec prisma db seed
pnpm --filter @gajayana/field-service exec prisma db push
pnpm --filter @gajayana/field-service exec prisma db seed
pnpm --filter @gajayana/booking-service exec prisma db push
pnpm --filter @gajayana/payment-service exec prisma db push
pnpm --filter @gajayana/payment-service exec prisma db seed
pnpm --filter @gajayana/notification-service exec prisma db push
```

API Gateway: http://localhost:3000  
RabbitMQ Management: http://localhost:15672 (guest/guest)

## Local development (without Docker for app processes)

1. Start RabbitMQ and PostgreSQL instances (e.g. via Docker):

```bash
docker compose up -d rabbitmq postgres-user postgres-field postgres-booking postgres-payment postgres-notification
```

2. Copy `.env.example` to `.env` and set `DATABASE_URL_*` and `RABBITMQ_URL` per service.

3. Install and build:

```bash
pnpm install
pnpm --filter @gajayana/shared build
pnpm -r run db:push
pnpm -r run db:seed
```

4. Run all services (in separate terminals or use a process manager):

```bash
pnpm --filter @gajayana/user-service run dev
pnpm --filter @gajayana/field-service run dev
pnpm --filter @gajayana/booking-service run dev
pnpm --filter @gajayana/payment-service run dev
pnpm --filter @gajayana/notification-service run dev
pnpm --filter @gajayana/api-gateway run dev
```

## API (via Gateway, base URL http://localhost:3000)

- `GET/POST /api/users` – list / create users
- `GET/PATCH /api/users/:id` – get / update user
- `GET /api/memberships/plans` – membership plans
- `POST /api/memberships` – create membership
- `GET /api/facilities`, `GET /api/facilities/types` – facilities
- `POST /api/slots`, `GET /api/slots/facility/:facilityId/available?date=YYYY-MM-DD` – slots
- `POST /api/slots/:id/reserve`, `POST /api/slots/:id/release` – reserve / release slot
- `POST /api/bookings`, `GET /api/bookings/:id`, `POST /api/bookings/:id/confirm`, `POST /api/bookings/:id/cancel`
- `GET /api/invoices/user/:userId`, `GET /api/invoices/:id`, `POST /api/invoices/payments`, `POST /api/invoices/payments/:id/complete`

## Event flow (RabbitMQ)

- **user-service**: publishes `user.created`, `user.updated`, `membership.changed`
- **field-service**: publishes `field.created`, `slot.booked`, `slot.released`
- **booking-service**: publishes `booking.created`, `booking.confirmed`, `booking.cancelled`; consumes `payment.completed` → confirms booking
- **payment-service**: consumes `booking.confirmed` → creates invoice; publishes `payment.completed`, `payment.failed`
- **notification-service**: consumes `user.created`, `booking.created`, `booking.confirmed`, `payment.completed` → logs notifications (idempotent)

## Database design

Each service has its own PostgreSQL database, normalized to at least **3NF**, with indexes for:

- Lookups: unique on business keys (email, booking_id for invoice, reference_number)
- Filters: status, dates, user_id, facility_id, slot_id
- Composite indexes for common queries (e.g. facility_id + slot_date, booking_date + status)

See **ARCHITECTURE_PLAN.md** for full schema and event details.
