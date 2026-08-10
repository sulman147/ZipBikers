import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus } from '../../common/types';
import { CreatePaymentDto } from '../dto/create-payment.dto';

const PAYMENT_STATUSES: PaymentStatus[] = ['PAID', 'UNPAID', 'PARTIAL'];

export class PaymentEntity extends CreatePaymentDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Derived server-side from the assignment.' })
  riderId: string;

  @ApiProperty({ description: 'Derived server-side from the assignment.' })
  bikeId: string;

  @ApiProperty({ description: 'Derived server-side from amountDue vs amountPaid.', enum: PAYMENT_STATUSES })
  status: PaymentStatus;

  @ApiProperty({ description: 'Defaults to the assignment monthlyRent when omitted on create.' })
  amountDue: number;

  @ApiProperty({ description: 'Defaults to 0 when omitted on create.' })
  amountPaid: number;
}