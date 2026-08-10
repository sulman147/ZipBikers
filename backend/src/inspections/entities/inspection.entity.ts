import { ApiProperty } from '@nestjs/swagger';
import { CreateInspectionDto } from '../dto/create-inspection.dto';

export class InspectionEntity extends CreateInspectionDto {
  @ApiProperty()
  id: string;
}