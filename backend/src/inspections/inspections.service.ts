import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '../common/base-crud.service';
import { Inspection } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class InspectionsService extends BaseCrudService<Inspection> {
  protected readonly collection = 'inspections';
  protected readonly idPrefix = 'inspection';
  // Inspection has no createdAt/updatedAt fields per the API contract.

  constructor(db: JsonDbService) {
    super(db);
  }
}
