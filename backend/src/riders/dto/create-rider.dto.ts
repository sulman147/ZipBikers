import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';
import { RiderStatus } from '../../common/types';

const RIDER_STATUSES: RiderStatus[] = ['ACTIVE', 'INACTIVE'];

export class CreateRiderDto {
  @IsString()
  fullName: string;

  @IsString()
  qid: string;

  @IsString()
  passportNumber: string;

  @IsString()
  drivingLicence: string;

  @IsString()
  employer: string;

  @IsString()
  phone: string;

  @IsString()
  emergencyContactName: string;

  @IsString()
  emergencyContactPhone: string;

  @IsArray()
  @IsString({ each: true })
  documents: string[];

  @IsOptional()
  @IsString()
  assignedBikeId: string | null;

  @IsIn(RIDER_STATUSES)
  status: RiderStatus;
}
