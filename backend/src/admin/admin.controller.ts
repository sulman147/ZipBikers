import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JsonDbService } from '../database/json-db.service';
import type { User } from '../common/types';

/**
 * ADMIN-only data migration endpoints on top of JsonDbService's raw
 * collection storage. Unlike the per-resource CRUD endpoints (which always
 * server-generate a fresh id on create), these operate on the whole
 * `db.json` blob directly so ids and cross-references stay byte-for-byte
 * intact across an export/import round trip.
 */
@ApiTags('admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly db: JsonDbService) {}

  @Get('db-export')
  @ApiOperation({ summary: 'ADMIN only: export every collection in the database, for backup purposes' })
  export(@CurrentUser() user: User) {
    this.assertAdmin(user);
    return this.db.exportAll();
  }

  @Post('db-import')
  @ApiOperation({
    summary: 'ADMIN only: atomically replace every collection in the database with the given data. DESTRUCTIVE - overwrites all existing records.',
  })
  import(@CurrentUser() user: User, @Body() body: Record<string, unknown>) {
    this.assertAdmin(user);
    const collections = this.db.importAll(body);
    return { success: true, collections };
  }

  private assertAdmin(user: User) {
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
  }
}
