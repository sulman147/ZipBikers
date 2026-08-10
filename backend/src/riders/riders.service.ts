import { Injectable } from '@nestjs/common';
import { BaseCrudService, TimestampOptions } from '../common/base-crud.service';
import { Rider } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class RidersService extends BaseCrudService<Rider> {
  protected readonly collection = 'riders';
  protected readonly idPrefix = 'rider';
  protected readonly timestamps: TimestampOptions = { createdAt: true };

  constructor(db: JsonDbService) {
    super(db);
  }
}
