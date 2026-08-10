import { IsArray, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { ExpenseCategory } from '../../common/types';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'MAINTENANCE',
  'ACCESSORIES',
  'WASHING',
  'LABOUR',
  'INSURANCE',
  'REGISTRATION',
  'REPAIRS',
  'MISCELLANEOUS',
];

export class CreateExpenseDto {
  @IsIn(EXPENSE_CATEGORIES)
  category: ExpenseCategory;

  @IsOptional()
  @IsString()
  bikeId: string | null;

  @IsNumber()
  amount: number;

  @IsString()
  supplier: string;

  @IsArray()
  @IsString({ each: true })
  invoiceImages: string[];

  @IsOptional()
  @IsString()
  notes: string;

  @IsString()
  date: string;
}
