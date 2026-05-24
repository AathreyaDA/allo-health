# Inventory Reservation System

A full-stack inventory reservation system built with Next.js, Prisma, PostgreSQL, and NeonDB.

This project implements transactional inventory reservations with expiration handling, reservation confirmation/release flows, and concurrency-safe stock management.

---

## Live Demo

Deployment:
[https://allo-inventory-one-kappa.vercel.app](https://allo-inventory-one-kappa.vercel.app/)

Repository:
https://github.com/AathreyaDA/allo-health

## Features

- Real-time inventory reservation system
- Multi-warehouse inventory tracking
- Reservation expiration handling
- Atomic stock reservation using database transactions
- Concurrency-safe inventory locking with `FOR UPDATE`
- Reservation confirmation and release flows
- Automatic expired reservation cleanup
- Zod request validation
- Dark/light theme UI
- Fully deployed on Vercel

---

## Tech Stack

### Frontend
- Next.js 15
- React 19
- Tailwind CSS v4
- shadcn/ui
- Sonner
- next-themes

### Backend
- Next.js Route Handlers
- Prisma ORM
- PostgreSQL
- NeonDB

### Validation & Utilities
- Zod

---

## Architecture Decisions

### Why Transactions?

Reservation creation, confirmation, and release operations are wrapped in Prisma transactions to ensure stock consistency.

This prevents:
- negative inventory
- double reservations
- inconsistent stock states

---

### Why Row Locking (`FOR UPDATE`)?

During reservation creation, inventory rows are locked using:

```sql
SELECT * FROM "Inventory"
WHERE ...
FOR UPDATE
```

This prevents race conditions where multiple users attempt to reserve the same stock simultaneously.

Without row locking:
- two requests could read the same available stock
- both could reserve successfully
- inventory would become inconsistent

---

## Reservation Lifecycle

Reservations begin in a `PENDING` state.

They can then transition into:
- `CONFIRMED`
- `RELEASED`

Reservations also contain an expiration timestamp.

If a reservation expires:
- confirmation is rejected
- reserved stock is automatically released
- reservation state changes to `RELEASED`

---

## Expired Reservation Cleanup

The system includes a cleanup route for abandoned reservations.

This handles scenarios where:
- users close the tab
- users never confirm or release reservations

Additionally, confirmation requests automatically release expired reservations if encountered.

---

## API Routes

### Products

#### `GET /api/products`

Returns all products with warehouse inventory information.

---

### Reservations

#### `POST /api/reservations`

Creates a reservation.

Request body:

```json
{
  "productId": "string",
  "warehouseId": "string",
  "quantity": 1
}
```

#### `GET /api/reservations/[id]`

Returns reservation details.

---

#### `POST /api/reservations/[id]/confirm`

Confirms a reservation and deducts stock.

---

#### `POST /api/reservations/[id]/release`

Releases a reservation and restores reserved inventory.

---

#### `POST /api/cleanup-expired`

Releases expired pending reservations.

---

## Validation

Request validation is implemented using Zod.

Validation schemas are centralized in:

```txt
lib/validators.ts
```

Zod errors are formatted consistently through:

```txt
lib/errors.ts
```
### Setup environment variables

Create a `.env` file:

```env
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
```

### Run Prisma migrations

```bash
npx prisma migrate dev
```

### Seed database
```bash
npx prisma db seed
```

### Start development server
```bash
npm run dev
```

## Deployment

The application is deployed on Vercel.

Environment variables required:
- `DATABASE_URL`
- `DIRECT_URL`

---

## Future Improvements

- Idempotency keys for reservation creation
- Background cron-based cleanup scheduling
- Authentication and user accounts
- Reservation analytics dashboard
- WebSocket-based live inventory updates
- Maybe not expose the "reserve" logic to the users and let the front end allow them to buy like their usual experience with other sites.
---


## Author

Aathreya D A
