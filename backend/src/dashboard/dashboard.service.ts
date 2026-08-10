import { Injectable } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { JsonDbService } from '../database/json-db.service';
import {
  Bike,
  Expense,
  MaintenanceRecord,
  Payment,
  TrafficViolation,
} from '../common/types';
import {
  expenseCostForBike,
  isWithinDays,
  maintenanceCostForBike,
  monthKeyOf,
  round2,
} from '../common/analytics.util';

export class TopCostlyBike {
  @ApiProperty()
  bikeId: string;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  totalCost: number;
}

export class DashboardKpis {
  @ApiProperty()
  totalBikes: number;

  @ApiProperty()
  available: number;

  @ApiProperty()
  assigned: number;

  @ApiProperty()
  underMaintenance: number;

  @ApiProperty()
  monthlyRevenue: number;

  @ApiProperty()
  expectedRevenue: number;

  @ApiProperty()
  outstandingPayments: number;

  @ApiProperty()
  upcomingServices: number;

  @ApiProperty()
  insuranceExpiryCount: number;

  @ApiProperty()
  trafficFinesUnpaid: number;

  @ApiProperty()
  profit: number;

  @ApiProperty({ type: TopCostlyBike, isArray: true })
  topCostlyBikes: TopCostlyBike[];
}

@Injectable()
export class DashboardService {
  constructor(private readonly db: JsonDbService) {}

  getKpis(): DashboardKpis {
    const bikes = this.db.findAll<Bike>('bikes');
    const payments = this.db.findAll<Payment>('payments');
    const maintenance = this.db.findAll<MaintenanceRecord>('maintenance');
    const expenses = this.db.findAll<Expense>('expenses');
    const violations = this.db.findAll<TrafficViolation>('violations');

    const now = new Date();
    const currentMonthKey = now.toISOString().slice(0, 7);

    const totalBikes = bikes.length;
    const available = bikes.filter((b) => b.status === 'AVAILABLE').length;
    const assigned = bikes.filter((b) => b.status === 'ASSIGNED').length;
    const underMaintenance = bikes.filter((b) => b.status === 'MAINTENANCE').length;

    const paymentsThisMonth = payments.filter((p) => monthKeyOf(p.periodMonth) === currentMonthKey);
    const monthlyRevenue = round2(paymentsThisMonth.reduce((sum, p) => sum + p.amountPaid, 0));
    const expectedRevenue = round2(paymentsThisMonth.reduce((sum, p) => sum + p.amountDue, 0));

    const outstandingPayments = round2(
      payments
        .filter((p) => p.status !== 'PAID')
        .reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0),
    );

    // Maintenance records due for service within the next 30 days.
    const upcomingServices = maintenance.filter((m) => isWithinDays(m.nextServiceDueDate, 30, now)).length;

    // Bikes whose insurance expires within the next 60 days (contract does not
    // specify an exact window for this KPI; 60 days gives ops team lead time
    // to renew, consistent with the longer-horizon nature of insurance vs. servicing).
    const insuranceExpiryCount = bikes.filter((b) => isWithinDays(b.insuranceExpiryDate, 60, now)).length;

    const trafficFinesUnpaid = violations.filter((v) => v.status === 'UNPAID').length;

    const expensesThisMonth = expenses
      .filter((e) => monthKeyOf(e.date) === currentMonthKey)
      .reduce((sum, e) => sum + e.amount, 0);
    const maintenanceCostThisMonth = maintenance
      .filter((m) => monthKeyOf(m.serviceDate) === currentMonthKey)
      .reduce((sum, m) => sum + m.totalCost, 0);
    const profit = round2(monthlyRevenue - (expensesThisMonth + maintenanceCostThisMonth));

    const topCostlyBikes = bikes
      .map((b) => ({
        bikeId: b.id,
        registrationNumber: b.registrationNumber,
        totalCost: round2(maintenanceCostForBike(b.id, maintenance) + expenseCostForBike(b.id, expenses)),
      }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 5);

    return {
      totalBikes,
      available,
      assigned,
      underMaintenance,
      monthlyRevenue,
      expectedRevenue,
      outstandingPayments,
      upcomingServices,
      insuranceExpiryCount,
      trafficFinesUnpaid,
      profit,
      topCostlyBikes,
    };
  }
}
