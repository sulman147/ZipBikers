import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { NotificationType } from '../../common/types';

const NOTIFICATION_TYPES: NotificationType[] = [
  'SERVICE_REMINDER',
  'INSURANCE_EXPIRY',
  'PAYMENT_DUE',
  'OVERDUE_RENT',
  'UNPAID_FINE',
  'CONTRACT_EXPIRY',
];

export class CreateNotificationDto {
  @IsIn(NOTIFICATION_TYPES)
  type: NotificationType;

  @IsString()
  message: string;

  @IsString()
  relatedEntityType: string;

  @IsString()
  relatedEntityId: string;

  @IsOptional()
  @IsString()
  dueDate: string | null;

  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
