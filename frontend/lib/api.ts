import type {
  Assignment,
  Bike,
  BikeProfitability,
  DashboardKpis,
  Expense,
  ExpenseBreakdown,
  FleetUtilisation,
  Inspection,
  InsuranceExpiryReport,
  MaintenanceCostByBike,
  MaintenanceRecord,
  MonthlyRevenuePoint,
  Notification,
  Payment,
  Rider,
  RoiReport,
  TrafficFineReport,
  TrafficViolation,
  User,
  YearlyRevenuePoint,
} from './types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setSession(accessToken: string, user: User) {
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

class ApiRequestError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new ApiRequestError(401, 'Unauthorized');
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body?.message || message;
    } catch {
      // ignore body parse failure
    }
    throw new ApiRequestError(res.status, Array.isArray(message) ? message.join(', ') : message);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}
function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}
function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}
function del(path: string): Promise<{ success: true }> {
  return request<{ success: true }>(path, { method: 'DELETE' });
}

/* ---------------------------- Auth ---------------------------- */

export function login(email: string, password: string) {
  return post<{ accessToken: string; user: User }>('/auth/login', { email, password });
}

export function getMe() {
  return get<User>('/auth/me');
}

/* ---------------------------- Bikes ---------------------------- */

export const getBikes = () => get<Bike[]>('/bikes');
export const getBike = (id: string) => get<Bike>(`/bikes/${id}`);
export const createBike = (dto: Partial<Bike>) => post<Bike>('/bikes', dto);
export const updateBike = (id: string, patchBody: Partial<Bike>) => patch<Bike>(`/bikes/${id}`, patchBody);
export const deleteBike = (id: string) => del(`/bikes/${id}`);

/* ---------------------------- Riders ---------------------------- */

export const getRiders = () => get<Rider[]>('/riders');
export const getRider = (id: string) => get<Rider>(`/riders/${id}`);
export const createRider = (dto: Partial<Rider>) => post<Rider>('/riders', dto);
export const updateRider = (id: string, patchBody: Partial<Rider>) => patch<Rider>(`/riders/${id}`, patchBody);
export const deleteRider = (id: string) => del(`/riders/${id}`);

/* ---------------------------- Assignments ---------------------------- */

export const getAssignments = () => get<Assignment[]>('/assignments');
export const getAssignment = (id: string) => get<Assignment>(`/assignments/${id}`);
export const createAssignment = (dto: Partial<Assignment>) => post<Assignment>('/assignments', dto);
export const updateAssignment = (id: string, patchBody: Partial<Assignment>) =>
  patch<Assignment>(`/assignments/${id}`, patchBody);
export const deleteAssignment = (id: string) => del(`/assignments/${id}`);

/* ---------------------------- Payments ---------------------------- */

export const getPayments = () => get<Payment[]>('/payments');
export const getPayment = (id: string) => get<Payment>(`/payments/${id}`);
export const createPayment = (dto: Partial<Payment>) => post<Payment>('/payments', dto);
export const updatePayment = (id: string, patchBody: Partial<Payment>) => patch<Payment>(`/payments/${id}`, patchBody);
export const deletePayment = (id: string) => del(`/payments/${id}`);

/* ---------------------------- Maintenance ---------------------------- */

export const getMaintenanceRecords = () => get<MaintenanceRecord[]>('/maintenance');
export const getMaintenanceRecord = (id: string) => get<MaintenanceRecord>(`/maintenance/${id}`);
export const createMaintenanceRecord = (dto: Partial<MaintenanceRecord>) =>
  post<MaintenanceRecord>('/maintenance', dto);
export const updateMaintenanceRecord = (id: string, patchBody: Partial<MaintenanceRecord>) =>
  patch<MaintenanceRecord>(`/maintenance/${id}`, patchBody);
export const deleteMaintenanceRecord = (id: string) => del(`/maintenance/${id}`);

/* ---------------------------- Expenses ---------------------------- */

export const getExpenses = () => get<Expense[]>('/expenses');
export const getExpense = (id: string) => get<Expense>(`/expenses/${id}`);
export const createExpense = (dto: Partial<Expense>) => post<Expense>('/expenses', dto);
export const updateExpense = (id: string, patchBody: Partial<Expense>) => patch<Expense>(`/expenses/${id}`, patchBody);
export const deleteExpense = (id: string) => del(`/expenses/${id}`);

/* ---------------------------- Violations ---------------------------- */

export const getViolations = () => get<TrafficViolation[]>('/violations');
export const getViolation = (id: string) => get<TrafficViolation>(`/violations/${id}`);
export const createViolation = (dto: Partial<TrafficViolation>) => post<TrafficViolation>('/violations', dto);
export const updateViolation = (id: string, patchBody: Partial<TrafficViolation>) =>
  patch<TrafficViolation>(`/violations/${id}`, patchBody);
export const deleteViolation = (id: string) => del(`/violations/${id}`);

/* ---------------------------- Inspections ---------------------------- */

export const getInspections = () => get<Inspection[]>('/inspections');
export const getInspection = (id: string) => get<Inspection>(`/inspections/${id}`);
export const createInspection = (dto: Partial<Inspection>) => post<Inspection>('/inspections', dto);
export const updateInspection = (id: string, patchBody: Partial<Inspection>) =>
  patch<Inspection>(`/inspections/${id}`, patchBody);
export const deleteInspection = (id: string) => del(`/inspections/${id}`);

/* ---------------------------- Notifications ---------------------------- */

export const getNotifications = () => get<Notification[]>('/notifications');
export const getNotification = (id: string) => get<Notification>(`/notifications/${id}`);
export const createNotification = (dto: Partial<Notification>) => post<Notification>('/notifications', dto);
export const updateNotification = (id: string, patchBody: Partial<Notification>) =>
  patch<Notification>(`/notifications/${id}`, patchBody);
export const deleteNotification = (id: string) => del(`/notifications/${id}`);
export const markNotificationRead = (id: string) => patch<Notification>(`/notifications/${id}`, { read: true });

/* ---------------------------- Dashboard ---------------------------- */

export const getDashboardKpis = () => get<DashboardKpis>('/dashboard/kpis');

/* ---------------------------- Reports ---------------------------- */

export const getMonthlyRevenueReport = (year?: string) =>
  get<MonthlyRevenuePoint[]>(`/reports/monthly-revenue${year ? `?year=${year}` : ''}`);
export const getYearlyRevenueReport = () => get<YearlyRevenuePoint[]>('/reports/yearly-revenue');
export const getBikeProfitabilityReport = () => get<BikeProfitability[]>('/reports/bike-profitability');
export const getMaintenanceCostByBikeReport = () => get<MaintenanceCostByBike[]>('/reports/maintenance-cost-by-bike');
export const getTrafficFinesReport = () => get<TrafficFineReport[]>('/reports/traffic-fines');
export const getOutstandingPaymentsReport = () => get<Payment[]>('/reports/outstanding-payments');
export const getInsuranceExpiryReport = () => get<InsuranceExpiryReport[]>('/reports/insurance-expiry');
export const getServiceDueReport = () => get<MaintenanceRecord[]>('/reports/service-due');
export const getFleetUtilisationReport = () => get<FleetUtilisation>('/reports/fleet-utilisation');
export const getRoiReport = () => get<RoiReport[]>('/reports/roi');
export const getExpenseBreakdownReport = () => get<ExpenseBreakdown[]>('/reports/expense-breakdown');
export const getTopProfitableBikesReport = () => get<BikeProfitability[]>('/reports/top-profitable-bikes');
export const getHighestMaintenanceBikesReport = () => get<MaintenanceCostByBike[]>('/reports/highest-maintenance-bikes');

export { ApiRequestError };
