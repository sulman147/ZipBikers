import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { AssignmentStatus } from '../../common/types';

const ASSIGNMENT_STATUSES: AssignmentStatus[] = ['ACTIVE', 'COMPLETED', 'TERMINATED'];

export class CreateAssignmentDto {
  @IsString()
  bikeId: string;

  @IsString()
  riderId: string;

  @IsNumber()
  monthlyRent: number;

  @IsNumber()
  deposit: number;

  @IsString()
  contractStartDate: string;

  @IsOptional()
  @IsString()
  contractEndDate: string | null;

  @IsArray()
  @IsString({ each: true })
  beforePhotos: string[];

  @IsOptional()
  @IsString()
  signatureRider: string | null;

  @IsOptional()
  @IsString()
  signatureStaff: string | null;

  @IsIn(ASSIGNMENT_STATUSES)
  status: AssignmentStatus;
}
