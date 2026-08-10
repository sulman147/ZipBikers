import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { InspectionType } from '../../common/types';

const INSPECTION_TYPES: InspectionType[] = ['BEFORE', 'AFTER'];

export class CreateInspectionDto {
  @IsString()
  bikeId: string;

  @IsString()
  riderId: string;

  @IsString()
  assignmentId: string;

  @IsIn(INSPECTION_TYPES)
  type: InspectionType;

  @IsNumber()
  mileage: number;

  @IsString()
  condition: string;

  @IsOptional()
  @IsString()
  damageNotes: string;

  @IsArray()
  @IsString({ each: true })
  photos: string[];

  @IsOptional()
  @IsString()
  signature: string | null;

  @IsString()
  inspectionDate: string;
}
