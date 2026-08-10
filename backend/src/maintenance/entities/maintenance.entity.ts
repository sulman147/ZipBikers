import { ApiProperty } from '@nestjs/swagger';
import { CreateMaintenanceDto } from '../dto/create-maintenance.dto';

export class MaintenanceEntity extends CreateMaintenanceDto {
  @ApiProperty()
  id: string;
}