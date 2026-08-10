import { Injectable } from '@nestjs/common';
import { BaseCrudService, TimestampOptions } from '../common/base-crud.service';
import { Bike } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class BikesService extends BaseCrudService<Bike> {
  protected readonly collection = 'bikes';
  protected readonly idPrefix = 'bike';
  protected readonly timestamps: TimestampOptions = { createdAt: true, updatedAt: true };

  constructor(db: JsonDbService) {
    super(db);
  }
}
