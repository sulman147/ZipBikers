import { Injectable } from '@nestjs/common';
import { BaseCrudService, TimestampOptions } from '../common/base-crud.service';
import { Notification } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class NotificationsService extends BaseCrudService<Notification> {
  protected readonly collection = 'notifications';
  protected readonly idPrefix = 'notification';
  protected readonly timestamps: TimestampOptions = { createdAt: true };

  constructor(db: JsonDbService) {
    super(db);
  }

  create(dto: Partial<Notification>): Notification {
    return super.create({ read: false, ...dto });
  }
}
