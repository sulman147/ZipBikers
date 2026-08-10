import { ApiProperty } from '@nestjs/swagger';
import { CreateExpenseDto } from '../dto/create-expense.dto';

export class ExpenseEntity extends CreateExpenseDto {
  @ApiProperty()
  id: string;
}