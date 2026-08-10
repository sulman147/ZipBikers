import {
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BikeStatus } from '../../common/types';

const BIKE_STATUSES: BikeStatus[] = ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED'];

export class CreateBikeDto {
  @IsString()
  qrCode: string;

  @IsString()
  registrationNumber: string;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsNumber()
  purchasePrice: number;

  @IsNumber()
  registrationCost: number;

  @IsNumber()
  yearlyInsurance: number;

  @IsNumber()
  currentMileage: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  batteryHealth: number;

  @IsIn(BIKE_STATUSES)
  status: BikeStatus;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsArray()
  @IsString({ each: true })
  documents: string[];
}
