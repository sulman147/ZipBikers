import * as bcrypt from 'bcryptjs';
import {
  Assignment,
  Bike,
  Database,
  Expense,
  Inspection,
  MaintenanceRecord,
  Notification,
  Payment,
  Rider,
  TrafficViolation,
  UserRecord,
} from '../common/types';

/**
 * Deterministic seed data generator for the E-Bike Fleet Management System.
 * Runs exactly once, the first time `backend/data/db.json` is missing.
 * All amounts are in QAR (Qatari Riyal). Locations/employers are Doha-area
 * plausible values. Nothing here is randomised (Math.random) so a fresh
 * seed is reproducible and easy to reason about in tests / demos.
 */

const PLACEHOLDER_PHOTO = (seed: string) => `https://placehold.co/600x400?text=${encodeURIComponent(seed)}`;
const PLACEHOLDER_DOC = (seed: string) => `https://placehold.co/800x1100?text=${encodeURIComponent(seed)}`;

function buildBikes(): Bike[] {
  const specs: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    reg: string;
    purchasePrice: number;
    registrationCost: number;
    yearlyInsurance: number;
    currentMileage: number;
    batteryHealth: number;
    status: Bike['status'];
    insuranceExpiryDate: string;
    createdAt: string;
  }> = [
    { id: 'bike-001', brand: 'Yadea', model: 'G5', year: 2024, reg: '100234', purchasePrice: 6200, registrationCost: 320, yearlyInsurance: 420, currentMileage: 2140, batteryHealth: 97, status: 'AVAILABLE', insuranceExpiryDate: '2026-11-14', createdAt: '2024-02-10T08:00:00.000Z' },
    { id: 'bike-002', brand: 'Yadea', model: 'T9', year: 2023, reg: '100567', purchasePrice: 5800, registrationCost: 300, yearlyInsurance: 400, currentMileage: 8340, batteryHealth: 88, status: 'ASSIGNED', insuranceExpiryDate: '2026-08-22', createdAt: '2023-05-18T08:00:00.000Z' },
    { id: 'bike-003', brand: 'Segway', model: 'eMoped C80', year: 2024, reg: '101045', purchasePrice: 7100, registrationCost: 340, yearlyInsurance: 460, currentMileage: 5210, batteryHealth: 93, status: 'ASSIGNED', insuranceExpiryDate: '2026-09-05', createdAt: '2024-01-22T08:00:00.000Z' },
    { id: 'bike-004', brand: 'Segway', model: 'eMoped C90', year: 2023, reg: '101389', purchasePrice: 7450, registrationCost: 350, yearlyInsurance: 480, currentMileage: 11230, batteryHealth: 81, status: 'ASSIGNED', insuranceExpiryDate: '2026-12-30', createdAt: '2023-03-11T08:00:00.000Z' },
    { id: 'bike-005', brand: 'Super Soco', model: 'CPx', year: 2024, reg: '102011', purchasePrice: 7800, registrationCost: 360, yearlyInsurance: 520, currentMileage: 3890, batteryHealth: 95, status: 'ASSIGNED', insuranceExpiryDate: '2026-08-09', createdAt: '2024-04-02T08:00:00.000Z' },
    { id: 'bike-006', brand: 'Super Soco', model: 'TC Max', year: 2023, reg: '102456', purchasePrice: 7600, registrationCost: 355, yearlyInsurance: 500, currentMileage: 9875, batteryHealth: 84, status: 'ASSIGNED', insuranceExpiryDate: '2026-10-17', createdAt: '2023-06-28T08:00:00.000Z' },
    { id: 'bike-007', brand: 'Yadea', model: 'C1S', year: 2022, reg: '103078', purchasePrice: 4900, registrationCost: 270, yearlyInsurance: 360, currentMileage: 14520, batteryHealth: 74, status: 'ASSIGNED', insuranceExpiryDate: '2026-08-18', createdAt: '2022-09-14T08:00:00.000Z' },
    { id: 'bike-008', brand: 'Segway', model: 'eMoped E110S', year: 2024, reg: '103522', purchasePrice: 6900, registrationCost: 330, yearlyInsurance: 440, currentMileage: 1560, batteryHealth: 99, status: 'ASSIGNED', insuranceExpiryDate: '2027-01-05', createdAt: '2024-05-30T08:00:00.000Z' },
    { id: 'bike-009', brand: 'Super Soco', model: 'TS', year: 2023, reg: '104190', purchasePrice: 5400, registrationCost: 290, yearlyInsurance: 380, currentMileage: 7420, batteryHealth: 90, status: 'AVAILABLE', insuranceExpiryDate: '2026-09-27', createdAt: '2023-08-07T08:00:00.000Z' },
    { id: 'bike-010', brand: 'Yadea', model: 'G5', year: 2022, reg: '104733', purchasePrice: 4200, registrationCost: 250, yearlyInsurance: 350, currentMileage: 16980, batteryHealth: 68, status: 'MAINTENANCE', insuranceExpiryDate: '2026-08-12', createdAt: '2022-11-19T08:00:00.000Z' },
  ];

  return specs.map((s) => ({
    id: s.id,
    qrCode: `QR-${s.id.toUpperCase()}`,
    registrationNumber: s.reg,
    brand: s.brand,
    model: s.model,
    year: s.year,
    purchasePrice: s.purchasePrice,
    registrationCost: s.registrationCost,
    yearlyInsurance: s.yearlyInsurance,
    currentMileage: s.currentMileage,
    batteryHealth: s.batteryHealth,
    status: s.status,
    photos: [PLACEHOLDER_PHOTO(`${s.brand}+${s.model}+1`), PLACEHOLDER_PHOTO(`${s.brand}+${s.model}+2`)],
    documents: [PLACEHOLDER_DOC(`${s.id}-registration-card`)],
    createdAt: s.createdAt,
    updatedAt: s.createdAt,
    insuranceExpiryDate: s.insuranceExpiryDate,
  }));
}

function buildRiders(): Rider[] {
  const specs: Array<{
    id: string;
    fullName: string;
    qid: string;
    passportNumber: string;
    drivingLicence: string;
    employer: string;
    phone: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    assignedBikeId: string | null;
    status: Rider['status'];
    createdAt: string;
  }> = [
    { id: 'rider-001', fullName: 'Mohammad Rafiqul Islam', qid: '28556012345', passportNumber: 'EC1234567', drivingLicence: 'QDL-556231', employer: 'Talabat', phone: '+974 3312 4567', emergencyContactName: 'Abdul Islam', emergencyContactPhone: '+880 1712 345678', assignedBikeId: 'bike-002', status: 'ACTIVE', createdAt: '2026-01-25T09:00:00.000Z' },
    { id: 'rider-002', fullName: 'Sunil Kumar Thapa', qid: '28734098765', passportNumber: 'PA0234567', drivingLicence: 'QDL-556478', employer: 'Snoonu', phone: '+974 5523 1190', emergencyContactName: 'Kamala Thapa', emergencyContactPhone: '+977 984 1234567', assignedBikeId: 'bike-003', status: 'ACTIVE', createdAt: '2026-01-08T09:00:00.000Z' },
    { id: 'rider-003', fullName: 'Ramesh Bahadur Gurung', qid: '28611056789', passportNumber: 'PA0398214', drivingLicence: 'QDL-559012', employer: 'Rafeeq', phone: '+974 6698 3321', emergencyContactName: 'Sita Gurung', emergencyContactPhone: '+977 981 7654321', assignedBikeId: 'bike-004', status: 'ACTIVE', createdAt: '2025-11-22T09:00:00.000Z' },
    { id: 'rider-004', fullName: 'Juan Carlos Dela Cruz', qid: '28902078901', passportNumber: 'P1234567A', drivingLicence: 'QDL-561234', employer: 'Deliveroo', phone: '+974 3345 8821', emergencyContactName: 'Maria Dela Cruz', emergencyContactPhone: '+63 917 123 4567', assignedBikeId: 'bike-005', status: 'ACTIVE', createdAt: '2026-02-24T09:00:00.000Z' },
    { id: 'rider-005', fullName: 'Abdul Kareem Chowdhury', qid: '28479034567', passportNumber: 'EC7654321', drivingLicence: 'QDL-562987', employer: 'Talabat', phone: '+974 5567 2234', emergencyContactName: 'Rahim Chowdhury', emergencyContactPhone: '+880 1812 987654', assignedBikeId: 'bike-006', status: 'ACTIVE', createdAt: '2026-02-08T09:00:00.000Z' },
    { id: 'rider-006', fullName: 'Prakash Shrestha', qid: '28345067123', passportNumber: 'PA0567890', drivingLicence: 'QDL-563456', employer: 'Cari', phone: '+974 3378 9012', emergencyContactName: 'Gita Shrestha', emergencyContactPhone: '+977 985 6541230', assignedBikeId: 'bike-007', status: 'ACTIVE', createdAt: '2025-10-19T09:00:00.000Z' },
    { id: 'rider-007', fullName: 'Anwar Hossain Mridha', qid: '28590012987', passportNumber: 'EC9988776', drivingLicence: 'QDL-564678', employer: 'Snoonu', phone: '+974 6612 4409', emergencyContactName: 'Nasrin Hossain', emergencyContactPhone: '+880 1912 456789', assignedBikeId: 'bike-008', status: 'ACTIVE', createdAt: '2026-03-27T09:00:00.000Z' },
    { id: 'rider-008', fullName: 'Bimal Tamang', qid: '28221089456', passportNumber: 'PA0812345', drivingLicence: 'QDL-548821', employer: 'Rafeeq', phone: '+974 5541 7723', emergencyContactName: 'Deepa Tamang', emergencyContactPhone: '+977 980 1122334', assignedBikeId: null, status: 'INACTIVE', createdAt: '2025-05-15T09:00:00.000Z' },
  ];

  return specs.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    qid: s.qid,
    passportNumber: s.passportNumber,
    drivingLicence: s.drivingLicence,
    employer: s.employer,
    phone: s.phone,
    emergencyContactName: s.emergencyContactName,
    emergencyContactPhone: s.emergencyContactPhone,
    documents: [PLACEHOLDER_DOC(`${s.id}-qid`), PLACEHOLDER_DOC(`${s.id}-license`)],
    assignedBikeId: s.assignedBikeId,
    status: s.status,
    createdAt: s.createdAt,
  }));
}

function buildAssignments(): Assignment[] {
  const specs: Array<{
    id: string;
    bikeId: string;
    riderId: string;
    monthlyRent: number;
    deposit: number;
    contractStartDate: string;
    contractEndDate: string | null;
    status: Assignment['status'];
    createdAt: string;
  }> = [
    { id: 'assignment-001', bikeId: 'bike-002', riderId: 'rider-001', monthlyRent: 850, deposit: 1500, contractStartDate: '2026-02-01', contractEndDate: null, status: 'ACTIVE', createdAt: '2026-02-01T10:00:00.000Z' },
    { id: 'assignment-002', bikeId: 'bike-003', riderId: 'rider-002', monthlyRent: 900, deposit: 1600, contractStartDate: '2026-01-15', contractEndDate: null, status: 'ACTIVE', createdAt: '2026-01-15T10:00:00.000Z' },
    { id: 'assignment-003', bikeId: 'bike-004', riderId: 'rider-003', monthlyRent: 880, deposit: 1500, contractStartDate: '2025-12-01', contractEndDate: null, status: 'ACTIVE', createdAt: '2025-12-01T10:00:00.000Z' },
    { id: 'assignment-004', bikeId: 'bike-005', riderId: 'rider-004', monthlyRent: 920, deposit: 1700, contractStartDate: '2026-03-01', contractEndDate: null, status: 'ACTIVE', createdAt: '2026-03-01T10:00:00.000Z' },
    { id: 'assignment-005', bikeId: 'bike-006', riderId: 'rider-005', monthlyRent: 900, deposit: 1600, contractStartDate: '2026-02-15', contractEndDate: null, status: 'ACTIVE', createdAt: '2026-02-15T10:00:00.000Z' },
    { id: 'assignment-006', bikeId: 'bike-007', riderId: 'rider-006', monthlyRent: 750, deposit: 1200, contractStartDate: '2025-11-01', contractEndDate: null, status: 'ACTIVE', createdAt: '2025-11-01T10:00:00.000Z' },
    { id: 'assignment-007', bikeId: 'bike-008', riderId: 'rider-007', monthlyRent: 950, deposit: 1800, contractStartDate: '2026-04-01', contractEndDate: null, status: 'ACTIVE', createdAt: '2026-04-01T10:00:00.000Z' },
    { id: 'assignment-008', bikeId: 'bike-001', riderId: 'rider-008', monthlyRent: 800, deposit: 1400, contractStartDate: '2025-06-01', contractEndDate: '2025-12-15', status: 'COMPLETED', createdAt: '2025-06-01T10:00:00.000Z' },
    { id: 'assignment-009', bikeId: 'bike-009', riderId: 'rider-001', monthlyRent: 780, deposit: 1300, contractStartDate: '2025-08-01', contractEndDate: '2026-01-20', status: 'COMPLETED', createdAt: '2025-08-01T10:00:00.000Z' },
  ];

  return specs.map((s) => ({
    id: s.id,
    bikeId: s.bikeId,
    riderId: s.riderId,
    monthlyRent: s.monthlyRent,
    deposit: s.deposit,
    contractStartDate: s.contractStartDate,
    contractEndDate: s.contractEndDate,
    beforePhotos: [PLACEHOLDER_PHOTO(`${s.id}-before-1`), PLACEHOLDER_PHOTO(`${s.id}-before-2`)],
    signatureRider: PLACEHOLDER_DOC(`${s.id}-signature-rider`),
    signatureStaff: PLACEHOLDER_DOC(`${s.id}-signature-staff`),
    status: s.status,
    createdAt: s.createdAt,
  }));
}

function buildPayments(assignments: Assignment[]): Payment[] {
  const payments: Payment[] = [];
  let counter = 1;
  const nextId = () => `payment-${String(counter++).padStart(3, '0')}`;

  const activeMonths = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07'];
  const completedMonthsByAssignment: Record<string, string[]> = {
    'assignment-008': ['2025-10', '2025-11', '2025-12'],
    'assignment-009': ['2025-11', '2025-12', '2026-01'],
  };

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const completedAssignments = assignments.filter((a) => a.status === 'COMPLETED');

  activeAssignments.forEach((assignment, aIdx) => {
    activeMonths.forEach((month, mIdx) => {
      const isCurrentMonth = mIdx === activeMonths.length - 1; // 2026-07
      const dueDate = `${month}-05`;
      let status: Payment['status'];
      let amountPaid: number;
      let paidDate: string | null;
      let receiptNumber: string | null;

      if (!isCurrentMonth) {
        // past months: mostly PAID, occasionally PARTIAL
        const isPartial = (aIdx + mIdx) % 5 === 0;
        status = isPartial ? 'PARTIAL' : 'PAID';
        amountPaid = isPartial ? Math.round(assignment.monthlyRent * 0.5) : assignment.monthlyRent;
        paidDate = `${month}-0${((aIdx + mIdx) % 9) + 1}T12:00:00.000Z`;
        receiptNumber = `RCPT-${month.replace('-', '')}-${String(aIdx + 1).padStart(3, '0')}`;
      } else {
        // current month: rotate PAID / UNPAID / PARTIAL
        const pattern = aIdx % 3;
        if (pattern === 0) {
          status = 'PAID';
          amountPaid = assignment.monthlyRent;
          paidDate = '2026-07-06T12:00:00.000Z';
          receiptNumber = `RCPT-202607-${String(aIdx + 1).padStart(3, '0')}`;
        } else if (pattern === 1) {
          status = 'UNPAID';
          amountPaid = 0;
          paidDate = null;
          receiptNumber = null;
        } else {
          status = 'PARTIAL';
          amountPaid = Math.round(assignment.monthlyRent * 0.4);
          paidDate = '2026-07-10T12:00:00.000Z';
          receiptNumber = `RCPT-202607-${String(aIdx + 1).padStart(3, '0')}`;
        }
      }

      payments.push({
        id: nextId(),
        assignmentId: assignment.id,
        riderId: assignment.riderId,
        bikeId: assignment.bikeId,
        periodMonth: month,
        amountDue: assignment.monthlyRent,
        amountPaid,
        dueDate,
        paidDate,
        status,
        receiptNumber,
        notes: status === 'UNPAID' ? 'Reminder sent to rider' : '',
      });
    });
  });

  completedAssignments.forEach((assignment) => {
    const months = completedMonthsByAssignment[assignment.id] ?? [];
    months.forEach((month, mIdx) => {
      payments.push({
        id: nextId(),
        assignmentId: assignment.id,
        riderId: assignment.riderId,
        bikeId: assignment.bikeId,
        periodMonth: month,
        amountDue: assignment.monthlyRent,
        amountPaid: assignment.monthlyRent,
        dueDate: `${month}-05`,
        paidDate: `${month}-0${(mIdx % 9) + 1}T12:00:00.000Z`,
        status: 'PAID',
        receiptNumber: `RCPT-${month.replace('-', '')}-${assignment.id.slice(-3)}`,
        notes: 'Contract closed out - settled in full',
      });
    });
  });

  return payments;
}

function buildMaintenance(bikes: Bike[]): MaintenanceRecord[] {
  const workshops = [
    'Doha Bike Care Center',
    'Al Sadd Auto Workshop',
    'Lusail EV Service Point',
    'Industrial Area Bike Garage',
    'Al Wakrah Motors Workshop',
  ];
  const types: MaintenanceRecord['type'][] = [
    'OIL_CHANGE',
    'BRAKE_PADS',
    'TYRES',
    'BATTERY',
    'SUSPENSION',
    'ACCIDENT_REPAIR',
    'OTHER',
  ];
  const descriptions: Record<MaintenanceRecord['type'], string> = {
    OIL_CHANGE: 'Routine oil/lubricant change and chain lubrication',
    BRAKE_PADS: 'Front & rear brake pad replacement',
    TYRES: 'Tyre replacement due to wear',
    BATTERY: 'Battery pack diagnostic and cell balancing',
    SUSPENSION: 'Front fork suspension service',
    ACCIDENT_REPAIR: 'Bodywork and frame repair after minor collision',
    OTHER: 'General inspection and minor adjustments',
  };

  const records: MaintenanceRecord[] = [];
  let counter = 1;
  const nextId = () => `maintenance-${String(counter++).padStart(3, '0')}`;

  // Plan: bikes 1-5 get 2 records each (10), bikes 6-10 get 1 record each (5) = 15 total
  const plan: Array<{ bike: Bike; recordsForBike: number }> = bikes.map((b, i) => ({
    bike: b,
    recordsForBike: i < 5 ? 2 : 1,
  }));

  let globalIdx = 0;
  plan.forEach(({ bike, recordsForBike }) => {
    for (let r = 0; r < recordsForBike; r++) {
      const type = types[globalIdx % types.length];
      const workshop = workshops[globalIdx % workshops.length];
      const labourCost = 80 + (globalIdx % 6) * 35;
      const partsCost = 120 + (globalIdx % 8) * 60;
      const totalCost = labourCost + partsCost;
      // spread service dates across the past ~10 months
      const monthsAgo = 1 + (globalIdx % 10);
      const serviceDate = shiftMonth('2026-07-20', -monthsAgo);
      // roughly 5 of the 15 records get a due date within the next 30 days of 2026-07-30
      const dueSoon = globalIdx % 3 === 0;
      const nextServiceDueDate = type === 'ACCIDENT_REPAIR'
        ? null
        : dueSoon
          ? shiftMonth('2026-08-15', 0) // within 30 days of 2026-07-30
          : shiftMonth('2026-10-01', globalIdx % 3);
      const nextServiceDueMileage = type === 'ACCIDENT_REPAIR'
        ? null
        : bike.currentMileage + 300 + (globalIdx % 5) * 200;

      records.push({
        id: nextId(),
        bikeId: bike.id,
        type,
        description: descriptions[type],
        labourCost,
        partsCost,
        totalCost,
        workshop,
        invoiceNumber: `INV-2026-${String(1000 + globalIdx).padStart(4, '0')}`,
        invoiceImages: [PLACEHOLDER_DOC(`${bike.id}-maintenance-${globalIdx + 1}`)],
        mileageAtService: Math.max(0, bike.currentMileage - (recordsForBike - r) * 400),
        serviceDate,
        nextServiceDueDate,
        nextServiceDueMileage,
      });
      globalIdx++;
    }
  });

  return records;
}

function buildExpenses(bikes: Bike[]): Expense[] {
  const categories: Expense['category'][] = [
    'MAINTENANCE',
    'ACCESSORIES',
    'WASHING',
    'LABOUR',
    'INSURANCE',
    'REGISTRATION',
    'REPAIRS',
    'MISCELLANEOUS',
  ];
  const suppliers = [
    'Doha Spare Parts Trading',
    'Al Meera Accessories',
    'Sparkle Bike Wash Lusail',
    'Freelance Technician - Karim',
    'Qatar Insurance Company',
    'Ministry of Interior - Traffic Dept',
    'Al Sadd Auto Workshop',
    'Office Supplies Qatar',
  ];
  const months = ['2026-04', '2026-05', '2026-06', '2026-07'];

  const expenses: Expense[] = [];
  for (let i = 0; i < 12; i++) {
    const category = categories[i % categories.length];
    const supplier = suppliers[i % suppliers.length];
    const month = months[i % months.length];
    const day = String(3 + (i % 24)).padStart(2, '0');
    const bikeId = category === 'INSURANCE' || category === 'MISCELLANEOUS' ? null : bikes[i % bikes.length].id;
    const amount = 150 + (i % 10) * 85;

    expenses.push({
      id: `expense-${String(i + 1).padStart(3, '0')}`,
      category,
      bikeId,
      amount,
      supplier,
      invoiceImages: [PLACEHOLDER_DOC(`expense-${i + 1}-invoice`)],
      notes: `${category.replace('_', ' ').toLowerCase()} expense - ${supplier}`,
      date: `${month}-${day}`,
    });
  }
  return expenses;
}

function buildViolations(assignments: Assignment[]): TrafficViolation[] {
  const locations = [
    'Al Sadd, Doha',
    'West Bay, Doha',
    'Lusail Marina Blvd',
    'Salwa Road, Doha',
    'Al Waab Street, Doha',
    'The Pearl-Qatar',
    'Corniche Street, Doha',
    'Industrial Area, Doha',
  ];
  const violationTypes = [
    'Speeding',
    'Red Light Violation',
    'Illegal Parking',
    'Riding Without Helmet',
    'Using Phone While Riding',
    'Wrong Lane Usage',
  ];
  const responsibilities: TrafficViolation['responsibility'][] = ['RIDER', 'COMPANY', 'SHARED'];
  const statuses: TrafficViolation['status'][] = ['PAID', 'UNPAID', 'DISPUTED'];

  // pick 8 bikes to associate violations with, cycling through active assignments where possible
  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const violationBikeRider: Array<{ bikeId: string; riderId: string | null; date: string }> = [
    { bikeId: activeAssignments[0].bikeId, riderId: activeAssignments[0].riderId, date: '2026-05-12' },
    { bikeId: activeAssignments[1].bikeId, riderId: activeAssignments[1].riderId, date: '2026-06-02' },
    { bikeId: activeAssignments[2].bikeId, riderId: activeAssignments[2].riderId, date: '2026-04-18' },
    { bikeId: activeAssignments[3].bikeId, riderId: activeAssignments[3].riderId, date: '2026-07-05' },
    { bikeId: activeAssignments[4].bikeId, riderId: activeAssignments[4].riderId, date: '2026-07-20' },
    { bikeId: 'bike-001', riderId: null, date: '2026-03-09' }, // available bike, no rider at the time
    { bikeId: activeAssignments[5].bikeId, riderId: activeAssignments[5].riderId, date: '2026-06-25' },
    { bikeId: 'bike-009', riderId: null, date: '2026-02-14' }, // available bike, no rider at the time
  ];

  return violationBikeRider.map((v, i) => {
    const status = statuses[i % statuses.length];
    const paid = status === 'PAID';
    const dueDate = shiftDays(v.date, 21);
    return {
      id: `violation-${String(i + 1).padStart(3, '0')}`,
      fineId: `FINE-${20260 + i}`,
      moiReference: `MOI-2026-${String(84000 + i * 17)}`,
      bikeId: v.bikeId,
      riderId: v.riderId,
      violationDate: v.date,
      location: locations[i % locations.length],
      violationType: violationTypes[i % violationTypes.length],
      amount: 300 + (i % 5) * 150,
      responsibility: v.riderId ? responsibilities[i % responsibilities.length] : 'COMPANY',
      dueDate,
      status,
      fineScreenshot: PLACEHOLDER_DOC(`violation-${i + 1}-fine-screenshot`),
      officialImage: PLACEHOLDER_DOC(`violation-${i + 1}-official-image`),
      paymentReceipt: paid ? PLACEHOLDER_DOC(`violation-${i + 1}-receipt`) : null,
      receiptNumber: paid ? `RCPT-VIO-${String(i + 1).padStart(3, '0')}` : null,
      paymentDate: paid ? shiftDays(v.date, 10) : null,
    };
  });
}

function buildInspections(assignments: Assignment[]): Inspection[] {
  const inspections: Inspection[] = [];
  let counter = 1;
  const nextId = () => `inspection-${String(counter++).padStart(3, '0')}`;

  const activeAssignments = assignments.filter((a) => a.status === 'ACTIVE');
  const completedAssignments = assignments.filter((a) => a.status === 'COMPLETED');

  // BEFORE inspection for every active assignment, at contract start
  activeAssignments.forEach((a) => {
    inspections.push({
      id: nextId(),
      bikeId: a.bikeId,
      riderId: a.riderId,
      assignmentId: a.id,
      type: 'BEFORE',
      mileage: 100,
      condition: 'Good - minor scratches on rear fender',
      damageNotes: 'No mechanical issues noted at handover',
      photos: [PLACEHOLDER_PHOTO(`${a.id}-before-inspection-1`), PLACEHOLDER_PHOTO(`${a.id}-before-inspection-2`)],
      signature: PLACEHOLDER_DOC(`${a.id}-inspection-signature`),
      inspectionDate: a.contractStartDate,
    });
  });

  // BEFORE + AFTER pair for every completed assignment
  completedAssignments.forEach((a) => {
    inspections.push({
      id: nextId(),
      bikeId: a.bikeId,
      riderId: a.riderId,
      assignmentId: a.id,
      type: 'BEFORE',
      mileage: 50,
      condition: 'Excellent - new bike handover',
      damageNotes: 'No damage at handover',
      photos: [PLACEHOLDER_PHOTO(`${a.id}-before-inspection-1`)],
      signature: PLACEHOLDER_DOC(`${a.id}-inspection-signature-before`),
      inspectionDate: a.contractStartDate,
    });
    inspections.push({
      id: nextId(),
      bikeId: a.bikeId,
      riderId: a.riderId,
      assignmentId: a.id,
      type: 'AFTER',
      mileage: 4200,
      condition: 'Fair - normal wear and tear',
      damageNotes: 'Small scratch on left mirror, otherwise acceptable condition on return',
      photos: [PLACEHOLDER_PHOTO(`${a.id}-after-inspection-1`)],
      signature: PLACEHOLDER_DOC(`${a.id}-inspection-signature-after`),
      inspectionDate: a.contractEndDate ?? a.contractStartDate,
    });
  });

  return inspections;
}

function buildNotifications(
  maintenance: MaintenanceRecord[],
  bikes: Bike[],
  payments: Payment[],
  violations: TrafficViolation[],
  assignments: Assignment[],
): Notification[] {
  const dueSoonMaintenance = maintenance.find((m) => m.nextServiceDueDate === '2026-08-15');
  const insuranceSoonBike = bikes.reduce((closest, b) =>
    !closest || (b.insuranceExpiryDate ?? '') < (closest.insuranceExpiryDate ?? '') ? b : closest,
  bikes[0]);
  const unpaidPayment = payments.find((p) => p.status === 'UNPAID');
  const overduePayment = payments.find((p) => p.status === 'PARTIAL' && p.periodMonth === '2026-07');
  const unpaidViolation = violations.find((v) => v.status === 'UNPAID');
  const longestActiveAssignment = assignments.find((a) => a.id === 'assignment-006');

  const notifications: Notification[] = [
    {
      id: 'notification-001',
      type: 'SERVICE_REMINDER',
      message: `Upcoming service due for bike ${dueSoonMaintenance?.bikeId ?? 'bike-001'} within 30 days`,
      relatedEntityType: 'maintenance',
      relatedEntityId: dueSoonMaintenance?.id ?? 'maintenance-001',
      dueDate: dueSoonMaintenance?.nextServiceDueDate ?? '2026-08-15',
      read: false,
      createdAt: '2026-07-25T09:00:00.000Z',
    },
    {
      id: 'notification-002',
      type: 'INSURANCE_EXPIRY',
      message: `Insurance for bike ${insuranceSoonBike.registrationNumber} expires soon`,
      relatedEntityType: 'bike',
      relatedEntityId: insuranceSoonBike.id,
      dueDate: insuranceSoonBike.insuranceExpiryDate ?? null,
      read: false,
      createdAt: '2026-07-20T09:00:00.000Z',
    },
    {
      id: 'notification-003',
      type: 'PAYMENT_DUE',
      message: `Payment due for rider on assignment ${unpaidPayment?.assignmentId ?? 'assignment-002'}`,
      relatedEntityType: 'payment',
      relatedEntityId: unpaidPayment?.id ?? 'payment-001',
      dueDate: unpaidPayment?.dueDate ?? '2026-07-05',
      read: false,
      createdAt: '2026-07-06T09:00:00.000Z',
    },
    {
      id: 'notification-004',
      type: 'OVERDUE_RENT',
      message: `Partial rent payment overdue for assignment ${overduePayment?.assignmentId ?? 'assignment-003'}`,
      relatedEntityType: 'payment',
      relatedEntityId: overduePayment?.id ?? 'payment-002',
      dueDate: overduePayment?.dueDate ?? '2026-07-05',
      read: true,
      createdAt: '2026-07-12T09:00:00.000Z',
    },
    {
      id: 'notification-005',
      type: 'UNPAID_FINE',
      message: `Unpaid traffic fine ${unpaidViolation?.fineId ?? 'FINE-20260'} requires settlement`,
      relatedEntityType: 'violation',
      relatedEntityId: unpaidViolation?.id ?? 'violation-001',
      dueDate: unpaidViolation?.dueDate ?? '2026-06-10',
      read: false,
      createdAt: '2026-06-15T09:00:00.000Z',
    },
    {
      id: 'notification-006',
      type: 'CONTRACT_EXPIRY',
      message: `Contract review recommended for long-running assignment ${longestActiveAssignment?.id ?? 'assignment-006'}`,
      relatedEntityType: 'assignment',
      relatedEntityId: longestActiveAssignment?.id ?? 'assignment-006',
      dueDate: '2026-11-01',
      read: true,
      createdAt: '2026-07-01T09:00:00.000Z',
    },
  ];

  return notifications;
}

function buildUsers(): UserRecord[] {
  const passwordHash = bcrypt.hashSync('password123', 10);
  return [
    { id: 'user-001', name: 'Fleet Admin', email: 'admin@fleet.com', role: 'ADMIN', passwordHash },
    { id: 'user-002', name: 'Fleet Staff', email: 'staff@fleet.com', role: 'STAFF', passwordHash },
    { id: 'user-003', name: 'Fleet Accountant', email: 'accounts@fleet.com', role: 'ACCOUNTANT', passwordHash },
  ];
}

/** Shift a YYYY-MM-DD date string by a number of whole months (can be negative). */
function shiftMonth(dateStr: string, deltaMonths: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCMonth(d.getUTCMonth() + deltaMonths);
  return d.toISOString().slice(0, 10);
}

/** Shift a YYYY-MM-DD date string by a number of whole days (can be negative). */
function shiftDays(dateStr: string, deltaDays: number): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

export function buildSeedData(): Database {
  const bikes = buildBikes();
  const riders = buildRiders();
  const assignments = buildAssignments();
  const payments = buildPayments(assignments);
  const maintenance = buildMaintenance(bikes);
  const expenses = buildExpenses(bikes);
  const violations = buildViolations(assignments);
  const inspections = buildInspections(assignments);
  const notifications = buildNotifications(maintenance, bikes, payments, violations, assignments);
  const users = buildUsers();

  return {
    bikes,
    riders,
    assignments,
    payments,
    maintenance,
    expenses,
    violations,
    inspections,
    notifications,
    users,
  };
}
