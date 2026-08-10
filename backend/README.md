# E-Bike Fleet Management - Backend

NestJS REST API with no real database - persists to `backend/data/db.json` via `JsonDbService`.
Implements the contract in `../docs/API_CONTRACT.md` exactly (routes, field names, status codes).

## Run

```bash
npm install
npm run start:dev
```

Server listens on `http://localhost:4000`, all routes under `/api`. CORS is enabled for
`http://localhost:3000`.

On first boot, if `data/db.json` doesn't exist, it is created and seeded with realistic
dummy data (10 bikes, 8 riders, 9 assignments, ~40 payments, ~15 maintenance records,
12 expenses, 8 violations, ~11 inspections, 6 notifications, 3 users). Delete `data/db.json`
and restart to re-seed from scratch.

## Auth

Seed users (password for all: `password123`):
- admin@fleet.com - ADMIN
- staff@fleet.com - STAFF
- accounts@fleet.com - ACCOUNTANT

`POST /api/auth/login` returns `{ accessToken, user }`. `GET /api/auth/me` requires
`Authorization: Bearer <token>` and is guarded by `JwtAuthGuard`.

## Guarding other routes (v1 note)

Only `GET /api/auth/me` is currently protected by `JwtAuthGuard`
(`src/auth/jwt-auth.guard.ts`). To protect additional routes later:

1. Import `AuthModule` into the feature module (it exports `JwtAuthGuard`), then add
   `@UseGuards(JwtAuthGuard)` to the controller class or individual handlers, e.g.:

   ```ts
   @UseGuards(JwtAuthGuard)
   @Controller('bikes')
   export class BikesController { ... }
   ```

2. Or, to protect everything globally, register `JwtAuthGuard` as an `APP_GUARD` in
   `app.module.ts` and add a `@Public()` decorator + matching check in the guard to opt
   routes like `/auth/login` out.

## Project layout

- `src/database/json-db.service.ts` - generic JSON-file-backed CRUD engine
- `src/database/seed.ts` - deterministic seed data generator (QAR amounts, Doha locations)
- `src/common/base-crud.service.ts` - shared CRUD logic (id generation, 404s, timestamps)
- One module per resource: `bikes`, `riders`, `assignments`, `payments`, `maintenance`,
  `expenses`, `violations`, `inspections`, `notifications`
- `src/auth/` - login, `/me`, JWT guard
- `src/dashboard/` - `GET /api/dashboard/kpis`
- `src/reports/` - all `GET /api/reports/*` endpoints
