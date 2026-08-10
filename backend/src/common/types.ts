/**
 * Shared TypeScript interfaces mirroring docs/API_CONTRACT.md exactly.
 * Field names/types here MUST stay in sync with the contract - the frontend
 * is built against the same document.
 */

export type Role = 'ADMIN' | 'STAFF' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/** Internal-only shape stored in db.json (has passwordHash, not returned to clients). */
export interface UserRecord extends User {
  passwordHash: string;
}

export type BikeStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'RETIRED';

export interface Bike {
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
  batteryHealth: number;
  status: BikeStatus;
  photos: string[];
  documents: string[];
  createdAt: string;
  updatedAt: string;
  /** v1 seed-only helper field (not in contract's public type but used by insurance-expiry report). */
  insuranceExpiryDate?: string;
}

export type RiderStatus = 'ACTIVE' | 'INACTIVE';

export interface Rider {
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

export type AssignmentStatus = 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export interface Assignment {
  id: string;
  bikeId: string;
  riderId: string;
  monthlyRent: number;
  deposit: number;
  contractStartDate: string;
  contractEndDate: string | null;
  beforePhotos: string[];
  signatureRider: string | null;
  signatureStaff: string | null;
  status: AssignmentStatus;
  createdAt: string;
}

export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';

export interface Payment {
  id: string;
  assignmentId: string;
  riderId: string;
  bikeId: string;
  periodMonth: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  receiptNumber: string | null;
  notes: string;
}

export type MaintenanceType =
  | 'OIL_CHANGE'
  | 'BRAKE_PADS'
  | 'TYRES'
  | 'BATTERY'
  | 'SUSPENSION'
  | 'ACCIDENT_REPAIR'
  | 'OTHER';

export interface MaintenanceRecord {
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

export type ExpenseCategory =
  | 'MAINTENANCE'
  | 'ACCESSORIES'
  | 'WASHING'
  | 'LABOUR'
  | 'INSURANCE'
  | 'REGISTRATION'
  | 'REPAIRS'
  | 'MISCELLANEOUS';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  bikeId: string | null;
  amount: number;
  supplier: string;
  invoiceImages: string[];
  notes: string;
  date: string;
}

export type Responsibility = 'RIDER' | 'COMPANY' | 'SHARED';
export type ViolationStatus = 'PAID' | 'UNPAID' | 'DISPUTED';

export interface TrafficViolation {
  id: string;
  fineId: string;
  moiReference: string;
  bikeId: string;
  riderId: string | null;
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

export type InspectionType = 'BEFORE' | 'AFTER';

export interface Inspection {
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

export type NotificationType =
  | 'SERVICE_REMINDER'
  | 'INSURANCE_EXPIRY'
  | 'PAYMENT_DUE'
  | 'OVERDUE_RENT'
  | 'UNPAID_FINE'
  | 'CONTRACT_EXPIRY';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  relatedEntityType: string;
  relatedEntityId: string;
  dueDate: string | null;
  read: boolean;
  createdAt: string;
}

export interface Database {
  bikes: Bike[];
  riders: Rider[];
  assignments: Assignment[];
  payments: Payment[];
  maintenance: MaintenanceRecord[];
  expenses: Expense[];
  violations: TrafficViolation[];
  inspections: Inspection[];
  notifications: Notification[];
  users: UserRecord[];
}
