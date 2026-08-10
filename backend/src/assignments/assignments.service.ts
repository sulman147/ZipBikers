import { Injectable } from '@nestjs/common';
import { BaseCrudService, TimestampOptions } from '../common/base-crud.service';
import { Assignment } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class AssignmentsService extends BaseCrudService<Assignment> {
  protected readonly collection = 'assignments';
  protected readonly idPrefix = 'assignment';
  protected readonly timestamps: TimestampOptions = { createdAt: true };

  constructor(db: JsonDbService) {
    super(db);
  }
}
