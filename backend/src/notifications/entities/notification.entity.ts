import { ApiProperty } from '@nestjs/swagger';
import { CreateNotificationDto } from '../dto/create-notification.dto';

export class NotificationEntity extends CreateNotificationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ description: 'Defaults to false when omitted on create.' })
  read: boolean;
}