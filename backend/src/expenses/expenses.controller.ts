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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseEntity } from './entities/expense.entity';

@ApiTags('expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'List all expenses' })
  @ApiOkResponse({ type: ExpenseEntity, isArray: true })
  findAll() {
    return this.expensesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an expense by id' })
  @ApiParam({ name: 'id', description: 'Expense id' })
  @ApiOkResponse({ type: ExpenseEntity })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an expense' })
  @ApiCreatedResponse({ type: ExpenseEntity })
  create(@Body() dto: CreateExpenseDto) {
    return this.expensesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an expense' })
  @ApiParam({ name: 'id', description: 'Expense id' })
  @ApiOkResponse({ type: ExpenseEntity })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiParam({ name: 'id', description: 'Expense id' })
  @ApiOkResponse({ schema: { example: { success: true } } })
  @ApiNotFoundResponse({ description: 'Expense not found' })
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}