import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { JsonDbService } from '../database/json-db.service';
import {
  Bike,
  Expense,
  ExpenseCategory,
  MaintenanceRecord,
  Payment,
  TrafficViolation,
} from '../common/types';
import {
  expenseCostForBike,
  isWithinDays,
  maintenanceCostForBike,
  round2,
} from '../common/analytics.util';

export class MonthlyRevenueItem {
  @ApiProperty({ description: 'YYYY-MM' })
  month: string;

  @ApiProperty()
  revenue: number;
}

export class YearlyRevenueItem {
  @ApiProperty({ description: 'YYYY' })
  year: string;

  @ApiProperty()
  revenue: number;
}

export class BikeProfitability {
  @ApiProperty()
  bikeId: string;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  revenue: number;

  @ApiProperty()
  costs: number;

  @ApiProperty()
  profit: number;
}

export class MaintenanceCostByBike {
  @ApiProperty()
  bikeId: string;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  totalCost: number;

  @ApiProperty()
  recordCount: number;
}

export class TrafficFineSummary {
  @ApiProperty()
  bikeId: string;

  @ApiProperty({ nullable: true })
  riderId: string | null;

  @ApiProperty()
  count: number;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  unpaidAmount: number;
}

export class InsuranceExpiryItem {
  @ApiProperty()
  bikeId: string;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  yearlyInsurance: number;

  @ApiProperty()
  expiryDate: string;
}

export class FleetUtilisation {
  @ApiProperty()
  totalBikes: number;

  @ApiProperty()
  assigned: number;

  @ApiProperty()
  utilisationPercent: number;
}

export class RoiItem {
  @ApiProperty()
  bikeId: string;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  totalInvested: number;

  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  roiPercent: number;
}

export class ExpenseBreakdownItem {
  @ApiProperty()
  category: ExpenseCategory;

  @ApiProperty()
  total: number;
}

const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'MAINTENANCE',
  'ACCESSORIES',
  'WASHING',
  'LABOUR',
  'INSURANCE',
  'REGISTRATION',
  'REPAIRS',
  'MISCELLANEOUS',
];

@Injectable()
export class ReportsService {
  constructor(private readonly db: JsonDbService) {}

  monthlyRevenue(year?: string): MonthlyRevenueItem[] {
    const targetYear = year ?? String(new Date().getFullYear());
    const payments = this.db.findAll<Payment>('payments');

    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = String(i + 1).padStart(2, '0');
      const month = `${targetYear}-${monthNum}`;
      const revenue = payments
        .filter((p) => p.periodMonth === month)
        .reduce((sum, p) => sum + p.amountPaid, 0);
      return { month, revenue: round2(revenue) };
    });
  }

  yearlyRevenue(): YearlyRevenueItem[] {
    const payments = this.db.findAll<Payment>('payments');
    const byYear = new Map<string, number>();

    for (const p of payments) {
      const year = p.periodMonth.slice(0, 4);
      byYear.set(year, (byYear.get(year) ?? 0) + p.amountPaid);
    }

    return Array.from(byYear.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, revenue]) => ({ year, revenue: round2(revenue) }));
  }

  bikeProfitability(): BikeProfitability[] {
    const bikes = this.db.findAll<Bike>('bikes');
    const payments = this.db.findAll<Payment>('payments');
    const maintenance = this.db.findAll<MaintenanceRecord>('maintenance');
    const expenses = this.db.findAll<Expense>('expenses');

    return bikes.map((bike) => {
      const revenue = round2(
        payments.filter((p) => p.bikeId === bike.id).reduce((sum, p) => sum + p.amountPaid, 0),
      );
      const costs = round2(maintenanceCostForBike(bike.id, maintenance) + expenseCostForBike(bike.id, expenses));
      return {
        bikeId: bike.id,
        registrationNumber: bike.registrationNumber,
        revenue,
        costs,
        profit: round2(revenue - costs),
      };
    });
  }

  maintenanceCostByBike(): MaintenanceCostByBike[] {
    const bikes = this.db.findAll<Bike>('bikes');
    const maintenance = this.db.findAll<MaintenanceRecord>('maintenance');

    return bikes.map((bike) => {
      const records = maintenance.filter((m) => m.bikeId === bike.id);
      return {
        bikeId: bike.id,
        registrationNumber: bike.registrationNumber,
        totalCost: round2(records.reduce((sum, m) => sum + m.totalCost, 0)),
        recordCount: records.length,
      };
    });
  }

  trafficFines(): TrafficFineSummary[] {
    const violations = this.db.findAll<TrafficViolation>('violations');
    const groups = new Map<string, { bikeId: string; riderId: string | null; count: number; totalAmount: number; unpaidAmount: number }>();

    for (const v of violations) {
      const key = `${v.bikeId}::${v.riderId ?? 'null'}`;
      const existing = groups.get(key) ?? {
        bikeId: v.bikeId,
        riderId: v.riderId,
        count: 0,
        totalAmount: 0,
        unpaidAmount: 0,
      };
      existing.count += 1;
      existing.totalAmount += v.amount;
      if (v.status === 'UNPAID') {
        existing.unpaidAmount += v.amount;
      }
      groups.set(key, existing);
    }

    return Array.from(groups.values()).map((g) => ({
      ...g,
      totalAmount: round2(g.totalAmount),
      unpaidAmount: round2(g.unpaidAmount),
    }));
  }

  outstandingPayments(): Payment[] {
    return this.db.findAll<Payment>('payments').filter((p) => p.status !== 'PAID');
  }

  insuranceExpiry(): InsuranceExpiryItem[] {
    const bikes = this.db.findAll<Bike>('bikes');
    return bikes
      .map((b) => ({
        bikeId: b.id,
        registrationNumber: b.registrationNumber,
        yearlyInsurance: b.yearlyInsurance,
        expiryDate: b.insuranceExpiryDate ?? '',
      }))
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  }

  serviceDue(): MaintenanceRecord[] {
    const bikes = this.db.findAll<Bike>('bikes');
    const maintenance = this.db.findAll<MaintenanceRecord>('maintenance');
    const bikeById = new Map(bikes.map((b) => [b.id, b]));

    return maintenance.filter((m) => {
      const dueBySoonDate = isWithinDays(m.nextServiceDueDate, 30);
      const bike = bikeById.get(m.bikeId);
      const dueByMileage =
        m.nextServiceDueMileage != null && bike != null
          ? Math.abs(m.nextServiceDueMileage - bike.currentMileage) <= 300
          : false;
      return dueBySoonDate || dueByMileage;
    });
  }

  fleetUtilisation(): FleetUtilisation {
    const bikes = this.db.findAll<Bike>('bikes');
    const totalBikes = bikes.length;
    const assigned = bikes.filter((b) => b.status === 'ASSIGNED').length;
    const utilisationPercent = totalBikes > 0 ? round2((assigned / totalBikes) * 100) : 0;
    return { totalBikes, assigned, utilisationPercent };
  }

  roi(): RoiItem[] {
    const bikes = this.db.findAll<Bike>('bikes');
    const payments = this.db.findAll<Payment>('payments');
    const maintenance = this.db.findAll<MaintenanceRecord>('maintenance');
    const expenses = this.db.findAll<Expense>('expenses');

    return bikes.map((bike) => {
      const totalInvested = round2(
        bike.purchasePrice +
          bike.registrationCost +
          bike.yearlyInsurance +
          maintenanceCostForBike(bike.id, maintenance) +
          expenseCostForBike(bike.id, expenses),
      );
      const totalRevenue = round2(
        payments.filter((p) => p.bikeId === bike.id).reduce((sum, p) => sum + p.amountPaid, 0),
      );
      const roiPercent = totalInvested > 0 ? round2(((totalRevenue - totalInvested) / totalInvested) * 100) : 0;

      return {
        bikeId: bike.id,
        registrationNumber: bike.registrationNumber,
        totalInvested,
        totalRevenue,
        roiPercent,
      };
    });
  }

  expenseBreakdown(): ExpenseBreakdownItem[] {
    const expenses = this.db.findAll<Expense>('expenses');
    const totals = new Map<ExpenseCategory, number>(ALL_EXPENSE_CATEGORIES.map((c) => [c, 0]));

    for (const e of expenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
    }

    return ALL_EXPENSE_CATEGORIES.map((category) => ({
      category,
      total: round2(totals.get(category) ?? 0),
    }));
  }

  topProfitableBikes(): BikeProfitability[] {
    return this.bikeProfitability()
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
  }

  highestMaintenanceBikes(): MaintenanceCostByBike[] {
    return this.maintenanceCostByBike()
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);
  }
}
