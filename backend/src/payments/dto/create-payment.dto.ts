import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * riderId, bikeId and status are intentionally NOT accepted here even as
 * optional fields - PaymentsService always derives them server-side (rider/
 * bike from the assignment, status from amountDue vs amountPaid) so every
 * client gets the same authoritative behaviour instead of each UI
 * reimplementing the rule. Any of those keys present in the request body are
 * ignored.
 */
export class CreatePaymentDto {
  @IsString()
  assignmentId: string;

  @IsString()
  periodMonth: string;

  @IsOptional()
  @IsNumber()
  amountDue?: number; // defaults to the assignment's monthlyRent when omitted

  @IsOptional()
  @IsNumber()
  amountPaid?: number; // defaults to 0 (i.e. unpaid) when omitted

  @IsString()
  dueDate: string;

  @IsOptional()
  @IsString()
  paidDate?: string | null; // defaults to today once amountPaid > 0, else null

  @IsOptional()
  @IsString()
  receiptNumber: string | null;

  @IsOptional()
  @IsString()
  notes: string;
}
