import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { BikesModule } from './bikes/bikes.module';
import { RidersModule } from './riders/riders.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { PaymentsModule } from './payments/payments.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ViolationsModule } from './violations/violations.module';
import { InspectionsModule } from './inspections/inspections.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    BikesModule,
    RidersModule,
    AssignmentsModule,
    PaymentsModule,
    MaintenanceModule,
    ExpensesModule,
    ViolationsModule,
    InspectionsModule,
    NotificationsModule,
    DashboardModule,
    ReportsModule,
    AdminModule,
  ],
})
export class AppModule {}
