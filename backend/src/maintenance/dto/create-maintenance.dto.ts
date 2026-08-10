import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { MaintenanceType } from '../../common/types';

const MAINTENANCE_TYPES: MaintenanceType[] = [
  'OIL_CHANGE',
  'BRAKE_PADS',
  'TYRES',
  'BATTERY',
  'SUSPENSION',
  'ACCIDENT_REPAIR',
  'OTHER',
];

export class CreateMaintenanceDto {
  @IsString()
  bikeId: string;

  @IsIn(MAINTENANCE_TYPES)
  type: MaintenanceType;

  @IsString()
  description: string;

  @IsNumber()
  labourCost: number;

  @IsNumber()
  partsCost: number;

  @IsNumber()
  totalCost: number;

  @IsString()
  workshop: string;

  @IsString()
  invoiceNumber: string;

  @IsArray()
  @IsString({ each: true })
  invoiceImages: string[];

  @IsNumber()
  mileageAtService: number;

  @IsString()
  serviceDate: string;

  @IsOptional()
  @IsString()
  nextServiceDueDate: string | null;

  @IsOptional()
  @IsNumber()
  nextServiceDueMileage: number | null;
}
