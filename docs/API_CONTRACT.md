# E-Bike Fleet Management System — API Contract v1

This is the single source of truth for how the Next.js frontend (`frontend/`) talks to the
NestJS backend (`backend/`). Backend and frontend must both implement EXACTLY this contract —
field names, types, routes, and status codes — so they connect without changes on either side.

## Base setup

- Backend runs on `http://localhost:4000`, all routes prefixed with `/api`.
- Backend enables CORS for `http://localhost:3000` (Next.js dev server default).
- Backend has NO real database. It uses a `JsonDbService` that reads/writes a single
  `backend/data/db.json` file, with one array per collection (bikes, riders, assignments,
  payments, maintenance, expenses, violations, inspections, notifications, users). This file
  is seeded with realistic dummy data on first run if it doesn't exist.
- All list endpoints return plain JSON arrays (no pagination envelope) unless noted.
- All single-resource endpoints return the object directly (no `{ data: ... }` wrapper).
- Dates are ISO 8601 strings (`"2026-07-30"` for date-only, full ISO for datetime).
- IDs are strings (e.g. `"bike-001"`, generated as `<prefix>-<uuid>` or similar — frontend never
  generates IDs, backend always assigns them on create).
- Errors: `{ "statusCode": number, "message": string }` with standard HTTP status codes
  (400 validation, 401 auth, 404 not found).

## Auth

Simple JWT auth, seeded users only (no self-registration in v1).

- `POST /api/auth/login` — body `{ email, password }` → `{ accessToken: string, user: User }`
- `GET /api/auth/me` — header `Authorization: Bearer <token>` → `User`

```ts
type Role = 'ADMIN' | 'STAFF' | 'ACCOUNTANT';
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}
```

Seed users (password for all: `password123`):
- admin@fleet.com — ADMIN
- staff@fleet.com — STAFF
- accounts@fleet.com — ACCOUNTANT

Frontend stores `accessToken` in localStorage and sends `Authorization: Bearer <token>` on every
request. Protected routes return 401 if missing/invalid; frontend redirects to `/login`.

## Standard CRUD resources

For each resource below, the backend exposes the standard 5 routes:

```
GET    /api/<resource>        -> Resource[]
GET    /api/<resource>/:id    -> Resource
POST   /api/<resource>        -> Resource (201)
PATCH  /api/<resource>/:id    -> Resource
DELETE /api/<resource>/:id    -> { success: true } (200)
```

### Bike — `/api/bikes`

```ts
type BikeStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED';

interface Bike {
  id: string;
  qrCode: string;
  registrationNumber: string;
  brand: string;
  model: string;
  year: number;
  purchasePrice: number;
  registrationCost: number;
  yearlyInsurance: number;
  currentMileage: number;
  batteryHealth: number; // percent 0-100
  status: BikeStatus;
  photos: string[]; // URLs
  documents: string[]; // URLs
  createdAt: string;
  updatedAt: string;
}
```

### Rider — `/api/riders`

```ts
type RiderStatus = 'ACTIVE' | 'INACTIVE';

interface Rider {
  id: string;
  fullName: string;
  qid: string;
  passportNumber: string;
  drivingLicence: string;
  employer: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  documents: string[];
  assignedBikeId: string | null;
  status: RiderStatus;
  createdAt: string;
}
```

### Assignment (Bike Lease) — `/api/assignments`

```ts
type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

interface Assignment {
  id: string;
  bikeId: string;
  riderId: string;
  monthlyRent: number;
  deposit: number;
  contractStartDate: string;
  contractEndDate: string | null;
  beforePhotos: string[];
  signatureRider: string | null; // data URL or file URL
  signatureStaff: string | null;
  status: AssignmentStatus;
  createdAt: string;
}
```

### Payment — `/api/payments`

```ts
type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';

interface Payment {
  id: string;
  assignmentId: string;
  riderId: string;
  bikeId: string;
  periodMonth: string; // "2026-07"
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  receiptNumber: string | null;
  notes: string;
}
```

### Maintenance — `/api/maintenance`

```ts
type MaintenanceType =
  | 'OIL_CHANGE' | 'BRAKE_PADS' | 'TYRES' | 'BATTERY'
  | 'SUSPENSION' | 'ACCIDENT_REPAIR' | 'OTHER';

interface MaintenanceRecord {
  id: string;
  bikeId: string;
  type: MaintenanceType;
  description: string;
  labourCost: number;
  partsCost: number;
  totalCost: number;
  workshop: string;
  invoiceNumber: string;
  invoiceImages: string[];
  mileageAtService: number;
  serviceDate: string;
  nextServiceDueDate: string | null;
  nextServiceDueMileage: number | null;
}
```

### Expense — `/api/expenses`

```ts
type ExpenseCategory =
  | 'MAINTENANCE' | 'ACCESSORIES' | 'WASHING' | 'LABOUR'
  | 'INSURANCE' | 'REGISTRATION' | 'REPAIRS' | 'MISCELLANEOUS';

interface Expense {
  id: string;
  category: ExpenseCategory;
  bikeId: string | null;
  amount: number;
  supplier: string;
  invoiceImages: string[];
  notes: string;
  date: string;
}
```

### Traffic Violation — `/api/violations`

```ts
type Responsibility = 'RIDER' | 'COMPANY' | 'SHARED';
type ViolationStatus = 'PAID' | 'UNPAID' | 'DISPUTED';

interface TrafficViolation {
  id: string;
  fineId: string;
  moiReference: string;
  bikeId: string;
  riderId: string | null; // auto-detected from assignment active at violationDate
  violationDate: string;
  location: string;
  violationType: string;
  amount: number;
  responsibility: Responsibility;
  dueDate: string;
  status: ViolationStatus;
  fineScreenshot: string | null;
  officialImage: string | null;
  paymentReceipt: string | null;
  receiptNumber: string | null;
  paymentDate: string | null;
}
```

### Inspection — `/api/inspections`

```ts
type InspectionType = 'BEFORE' | 'AFTER';

interface Inspection {
  id: string;
  bikeId: string;
  riderId: string;
  assignmentId: string;
  type: InspectionType;
  mileage: number;
  condition: string;
  damageNotes: string;
  photos: string[];
  signature: string | null;
  inspectionDate: string;
}
```

### Notification — `/api/notifications`

```ts
type NotificationType =
  | 'SERVICE_REMINDER' | 'INSURANCE_EXPIRY' | 'PAYMENT_DUE'
  | 'OVERDUE_RENT' | 'UNPAID_FINE' | 'CONTRACT_EXPIRY';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  relatedEntityType: string; // e.g. "bike", "rider", "payment"
  relatedEntityId: string;
  dueDate: string | null;
  read: boolean;
  createdAt: string;
}
```

## Computed / aggregate endpoints (no CRUD, GET only)

### `GET /api/dashboard/kpis`

```ts
interface DashboardKpis {
  totalBikes: number;
  available: number;
  assigned: number;
  underMaintenance: number;
  monthlyRevenue: number;      // sum of amountPaid this calendar month
  expectedRevenue: number;     // sum of amountDue this calendar month
  outstandingPayments: number; // sum of (amountDue - amountPaid) where status != PAID
  upcomingServices: number;    // maintenance records with nextServiceDueDate within 30 days
  insuranceExpiryCount: number;
  trafficFinesUnpaid: number;
  profit: number;              // monthlyRevenue - (expenses + maintenance costs this month)
  topCostlyBikes: { bikeId: string; registrationNumber: string; totalCost: number }[]; // top 5
}
```

### `GET /api/reports/monthly-revenue?year=2026`
`{ month: string; revenue: number }[]` (12 entries, "2026-01".."2026-12")

### `GET /api/reports/yearly-revenue`
`{ year: string; revenue: number }[]`

### `GET /api/reports/bike-profitability`
`{ bikeId: string; registrationNumber: string; revenue: number; costs: number; profit: number }[]`

### `GET /api/reports/maintenance-cost-by-bike`
`{ bikeId: string; registrationNumber: string; totalCost: number; recordCount: number }[]`

### `GET /api/reports/traffic-fines`
`{ bikeId: string; riderId: string | null; count: number; totalAmount: number; unpaidAmount: number }[]`

### `GET /api/reports/outstanding-payments`
`Payment[]` filtered to status != PAID, joined isn't needed (frontend joins via bikeId/riderId already on the object).

### `GET /api/reports/insurance-expiry`
`{ bikeId: string; registrationNumber: string; yearlyInsurance: number; expiryDate: string }[]`
(v1: derive a synthetic `expiryDate` per bike stored in seed data alongside insurance amount — see backend seed notes.)

### `GET /api/reports/service-due`
`MaintenanceRecord[]` filtered to `nextServiceDueDate` within 30 days or `nextServiceDueMileage` within 300km of `currentMileage`.

### `GET /api/reports/fleet-utilisation`
`{ totalBikes: number; assigned: number; utilisationPercent: number }`

### `GET /api/reports/roi`
`{ bikeId: string; registrationNumber: string; totalInvested: number; totalRevenue: number; roiPercent: number }[]`

### `GET /api/reports/expense-breakdown`
`{ category: ExpenseCategory; total: number }[]`

### `GET /api/reports/top-profitable-bikes`
Same shape as bike-profitability, sorted desc, top 5.

### `GET /api/reports/highest-maintenance-bikes`
Same shape as maintenance-cost-by-bike, sorted desc, top 5.

## Seed data expectations

Backend seeds `db.json` on first boot with (approximate, realistic QAR amounts):
- 10 bikes (mixed brands: e.g. Yadea, Segway, Super Soco), statuses mixed (7 assigned, 2 available, 1 maintenance)
- 8 riders, 7 with an active assignment
- 7 active assignments + 2 completed historical ones
- ~40 payment records across last 4 months per active assignment (mix of PAID/UNPAID/PARTIAL)
- ~15 maintenance records spread across bikes, some with `nextServiceDueDate` in the next 30 days
- ~12 expense records across categories and months
- ~8 traffic violations, mixed status and responsibility
- ~10 inspection records (before/after pairs for a few assignments)
- ~6 notifications, mixed read/unread
- 3 seed users (admin/staff/accountant, see Auth section)

## Frontend integration notes

- All API calls go through a single typed client (e.g. `frontend/lib/api.ts`) using `fetch`,
  base URL from `NEXT_PUBLIC_API_URL` env var (default `http://localhost:4000/api`).
- Client attaches `Authorization: Bearer <token>` from localStorage automatically.
- On 401, client clears token and redirects to `/login`.
