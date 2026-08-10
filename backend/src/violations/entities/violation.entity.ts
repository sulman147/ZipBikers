import { ApiProperty } from '@nestjs/swagger';
import { CreateViolationDto } from '../dto/create-violation.dto';

export class ViolationEntity extends CreateViolationDto {
  @ApiProperty()
  id: string;
}