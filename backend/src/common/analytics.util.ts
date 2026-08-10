import { Bike, Expense, MaintenanceRecord } from './types';

/** Returns "YYYY-MM" for a date-like string (date-only or full ISO datetime). */
export function monthKeyOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/** True if `dateStr` (date-only or ISO datetime) falls within `daysAhead` days from now (and not in the past). */
export function isWithinDays(dateStr: string | null | undefined, daysAhead: number, now: Date = new Date()): boolean {
  if (!dateStr) return false;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return false;
  const diffMs = target.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= daysAhead;
}

/** Total maintenance cost incurred for a given bike (all-time). */
export function maintenanceCostForBike(bikeId: string, maintenance: MaintenanceRecord[]): number {
  return maintenance
    .filter((m) => m.bikeId === bikeId)
    .reduce((sum, m) => sum + m.totalCost, 0);
}

/** Total misc/expense cost incurred for a given bike (all-time). Company-wide expenses with bikeId=null are excluded. */
export function expenseCostForBike(bikeId: string, expenses: Expense[]): number {
  return expenses
    .filter((e) => e.bikeId === bikeId)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function registrationNumberOf(bikeId: string, bikes: Bike[]): string {
  return bikes.find((b) => b.id === bikeId)?.registrationNumber ?? 'UNKNOWN';
}
