# 🏟️ Gajayana Sport Center – Distributed Event-Driven Architecture

A premium, high-performance monorepo implementing a **Distributed Event-Driven Architecture** for managing a sports center. Built with mission-critical reliability using **TypeScript**, **RabbitMQ**, and **PostgreSQL**.

---

## ⚡ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Runtime** | [Node.js v18+](https://nodejs.org/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **API Framework** | [Express](https://expressjs.com/) |
| **Message Broker** | [RabbitMQ](https://www.rabbitmq.com/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) |
| **Package Manager** | [pnpm v10+](https://pnpm.io/) |
| **Orchestration** | [Podman Compose](https://podman.io/) / Docker Compose |
| **Gateway** | [Nginx](https://www.nginx.com/) |

---

## 🏗️ Microservices Architecture

Each service is independently deployable, has its own dedicated database, and communicates asynchronously via events.

| Service | Port | Database | Responsibilities |
| :--- | :--- | :--- | :--- |
| **api-gateway** | `3000` | — | High-performance Nginx reverse proxy |
| **user-service** | `3001` | `users_db` | Identity, RBAC, Membership lifecycle |
| **field-service** | `3002`, `3006` | `fields_db` | Facility management, Real-time slot availability |
| **booking-service** | `3003` | `bookings_db` | Booking orchestration, Status state machine |
| **payment-service** | `3004` | `payments_db` | Invoice generation, Payment reconciliation |
| **notification-service** | `3005` | `notifications_db` | Event-driven alerts, Idempotent delivery logs |

---

## 🚀 Quick Start (Podman/Docker)

Experience the full distributed system in minutes.

### 1. Configure Environment
```bash
cp .env.example .env
# Edit .env and ensure ports match your local environment
```

### 2. Launch Infrastructure & Services
```bash
pnpm podman:up
```

### 3. Initialize Databases
Sync schemas and populate initial data:
```bash
pnpm db:push
pnpm db:seed
```

---

## 🛠️ Local Development

For active development with hot-reloading:

1. **Start Infrastructure Only**:
   ```bash
   podman compose up -d rabbitmq postgres-user postgres-field postgres-booking postgres-payment postgres-notification
   ```
2. **Install & Build Shared Packages**:
   ```bash
   pnpm install
   pnpm --filter @gajayana/shared build
   ```
3. **Run All Services**:
   ```bash
   pnpm dev
   ```

---

## 📡 API Endpoints (Gateway: `http://localhost:3000`)

### 👤 User & Membership
- `POST /api/users` – Create new user
- `GET /api/users` – List all users
- `GET /api/users/:id` – Fetch user profile
- `GET /api/memberships/plans` – Browse membership plans
- `POST /api/memberships` – Purchase membership

### 🎾 Facilities & Slots
- `GET /api/facilities` – List sports facilities
- `GET /api/facilities/types` – List facility categories
- `GET /api/slots/facility/:id/available` – Real-time availability lookup
- `POST /api/slots/:id/reserve` – Temporary slot hold

### 📅 Bookings
- `POST /api/bookings` – Create booking request
- `GET /api/bookings/:id` – View booking status
- `POST /api/bookings/:id/confirm` – Finalize booking
- `GET /api/bookings/user/:userId` – User's booking history

### 💳 Payments & Invoices
- `GET /api/invoices/user/:userId` – User's billing history
- `POST /api/invoices/payments` – Initiate payment
- `POST /api/invoices/payments/:id/complete` – Mark payment as successful

---

## 🔄 Event Flow (Messaging)

The system uses a **Topic Exchange** pattern for reliable cross-service communication:

- **`user-service`** ➔ `user.created`, `membership.changed`
- **`field-service`** ➔ `slot.booked`, `slot.released`
- **`booking-service`** ➔ `booking.created`, `booking.confirmed`
- **`payment-service`** ➔ `payment.completed`, `payment.failed`

---

## 🔍 Health & Monitoring
- **Gateway Health**: `http://localhost:3000/health`
- **RabbitMQ Dashboard**: `http://localhost:15672` (guest/guest)
- **Database Visualizer**: Use [Prisma Studio](https://www.prisma.io/studio) in each service directory.

