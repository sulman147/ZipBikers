import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBikeDto } from '../dto/create-bike.dto';

export class BikeEntity extends CreateBikeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiPropertyOptional({ description: 'v1 seed-only helper field used by the insurance-expiry report.' })
  insuranceExpiryDate?: string;
}