import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  BikeProfitability,
  ExpenseBreakdownItem,
  FleetUtilisation,
  InsuranceExpiryItem,
  MaintenanceCostByBike,
  MonthlyRevenueItem,
  ReportsService,
  RoiItem,
  TrafficFineSummary,
  YearlyRevenueItem,
} from './reports.service';
import { MaintenanceEntity } from '../maintenance/entities/maintenance.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly-revenue')
  @ApiOperation({ summary: 'Revenue collected per month for a given year' })
  @ApiQuery({ name: 'year', required: false, description: 'Defaults to the current year (YYYY)' })
  @ApiOkResponse({ type: MonthlyRevenueItem, isArray: true })
  monthlyRevenue(@Query('year') year?: string) {
    return this.reportsService.monthlyRevenue(year);
  }

  @Get('yearly-revenue')
  @ApiOperation({ summary: 'Revenue collected per year' })
  @ApiOkResponse({ type: YearlyRevenueItem, isArray: true })
  yearlyRevenue() {
    return this.reportsService.yearlyRevenue();
  }

  @Get('bike-profitability')
  @ApiOperation({ summary: 'Revenue, costs and profit per bike' })
  @ApiOkResponse({ type: BikeProfitability, isArray: true })
  bikeProfitability() {
    return this.reportsService.bikeProfitability();
  }

  @Get('maintenance-cost-by-bike')
  @ApiOperation({ summary: 'Total maintenance cost and record count per bike' })
  @ApiOkResponse({ type: MaintenanceCostByBike, isArray: true })
  maintenanceCostByBike() {
    return this.reportsService.maintenanceCostByBike();
  }

  @Get('traffic-fines')
  @ApiOperation({ summary: 'Traffic fine totals grouped by bike/rider' })
  @ApiOkResponse({ type: TrafficFineSummary, isArray: true })
  trafficFines() {
    return this.reportsService.trafficFines();
  }

  @Get('outstanding-payments')
  @ApiOperation({ summary: 'Payments that are not fully paid' })
  @ApiOkResponse({ type: PaymentEntity, isArray: true })
  outstandingPayments() {
    return this.reportsService.outstandingPayments();
  }

  @Get('insurance-expiry')
  @ApiOperation({ summary: 'Bikes sorted by upcoming insurance expiry date' })
  @ApiOkResponse({ type: InsuranceExpiryItem, isArray: true })
  insuranceExpiry() {
    return this.reportsService.insuranceExpiry();
  }

  @Get('service-due')
  @ApiOperation({ summary: 'Maintenance records due soon by date or mileage' })
  @ApiOkResponse({ type: MaintenanceEntity, isArray: true })
  serviceDue() {
    return this.reportsService.serviceDue();
  }

  @Get('fleet-utilisation')
  @ApiOperation({ summary: 'Percentage of the fleet currently assigned' })
  @ApiOkResponse({ type: FleetUtilisation })
  fleetUtilisation() {
    return this.reportsService.fleetUtilisation();
  }

  @Get('roi')
  @ApiOperation({ summary: 'Return on investment per bike' })
  @ApiOkResponse({ type: RoiItem, isArray: true })
  roi() {
    return this.reportsService.roi();
  }

  @Get('expense-breakdown')
  @ApiOperation({ summary: 'Total expenses grouped by category' })
  @ApiOkResponse({ type: ExpenseBreakdownItem, isArray: true })
  expenseBreakdown() {
    return this.reportsService.expenseBreakdown();
  }

  @Get('top-profitable-bikes')
  @ApiOperation({ summary: 'Top 5 most profitable bikes' })
  @ApiOkResponse({ type: BikeProfitability, isArray: true })
  topProfitableBikes() {
    return this.reportsService.topProfitableBikes();
  }

  @Get('highest-maintenance-bikes')
  @ApiOperation({ summary: 'Top 5 bikes by maintenance cost' })
  @ApiOkResponse({ type: MaintenanceCostByBike, isArray: true })
  highestMaintenanceBikes() {
    return this.reportsService.highestMaintenanceBikes();
  }
}
