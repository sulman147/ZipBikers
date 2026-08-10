import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Responsibility, ViolationStatus } from '../../common/types';

const RESPONSIBILITIES: Responsibility[] = ['RIDER', 'COMPANY', 'SHARED'];
const VIOLATION_STATUSES: ViolationStatus[] = ['PAID', 'UNPAID', 'DISPUTED'];

export class CreateViolationDto {
  @IsString()
  fineId: string;

  @IsString()
  moiReference: string;

  @IsString()
  bikeId: string;

  @IsOptional()
  @IsString()
  riderId: string | null;

  @IsString()
  violationDate: string;

  @IsString()
  location: string;

  @IsString()
  violationType: string;

  @IsNumber()
  amount: number;

  @IsIn(RESPONSIBILITIES)
  responsibility: Responsibility;

  @IsString()
  dueDate: string;

  @IsIn(VIOLATION_STATUSES)
  status: ViolationStatus;

  @IsOptional()
  @IsString()
  fineScreenshot: string | null;

  @IsOptional()
  @IsString()
  officialImage: string | null;

  @IsOptional()
  @IsString()
  paymentReceipt: string | null;

  @IsOptional()
  @IsString()
  receiptNumber: string | null;

  @IsOptional()
  @IsString()
  paymentDate: string | null;
}
