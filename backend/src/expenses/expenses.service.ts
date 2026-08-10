import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '../common/base-crud.service';
import { Expense } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class ExpensesService extends BaseCrudService<Expense> {
  protected readonly collection = 'expenses';
  protected readonly idPrefix = 'expense';
  // Expense has no createdAt/updatedAt fields per the API contract.

  constructor(db: JsonDbService) {
    super(db);
  }
}
