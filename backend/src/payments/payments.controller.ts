import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentEntity } from './entities/payment.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all payments' })
  @ApiOkResponse({ type: PaymentEntity, isArray: true })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by id' })
  @ApiParam({ name: 'id', description: 'Payment id' })
  @ApiOkResponse({ type: PaymentEntity })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a payment',
    description:
      'riderId, bikeId and status are derived server-side from the assignment; any values for those keys in the request body are ignored.',
  })
  @ApiCreatedResponse({ type: PaymentEntity })
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a payment' })
  @ApiParam({ name: 'id', description: 'Payment id' })
  @ApiOkResponse({ type: PaymentEntity })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a payment' })
  @ApiParam({ name: 'id', description: 'Payment id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}