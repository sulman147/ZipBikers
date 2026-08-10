import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardKpis, DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get aggregate fleet KPIs for the current month' })
  @ApiOkResponse({ type: DashboardKpis })
  getKpis() {
    return this.dashboardService.getKpis();
  }
}