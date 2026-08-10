import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '../common/base-crud.service';
import { MaintenanceRecord } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class MaintenanceService extends BaseCrudService<MaintenanceRecord> {
  protected readonly collection = 'maintenance';
  protected readonly idPrefix = 'maintenance';
  // MaintenanceRecord has no createdAt/updatedAt fields per the API contract.

  constructor(db: JsonDbService) {
    super(db);
  }
}
