import { ApiProperty } from '@nestjs/swagger';
import { CreateRiderDto } from '../dto/create-rider.dto';

export class RiderEntity extends CreateRiderDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;
}