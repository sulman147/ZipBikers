import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '../common/base-crud.service';
import { Assignment, TrafficViolation } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

@Injectable()
export class ViolationsService extends BaseCrudService<TrafficViolation> {
  protected readonly collection = 'violations';
  protected readonly idPrefix = 'violation';
  // TrafficViolation has no createdAt/updatedAt fields per the API contract.

  constructor(db: JsonDbService) {
    super(db);
  }

  /**
   * Per the contract: riderId is "auto-detected from assignment active at
   * violationDate". If the caller didn't supply one, look up whichever
   * assignment for this bike was active on violationDate.
   */
  create(dto: Partial<TrafficViolation>): TrafficViolation {
    const riderId = dto.riderId ?? this.detectRiderId(dto.bikeId, dto.violationDate);
    return super.create({ ...dto, riderId });
  }

  private detectRiderId(bikeId?: string, violationDate?: string): string | null {
    if (!bikeId || !violationDate) return null;
    const assignments = this.db.findAll<Assignment>('assignments');
    const match = assignments.find((a) => {
      if (a.bikeId !== bikeId) return false;
      const start = a.contractStartDate;
      const end = a.contractEndDate ?? '9999-12-31';
      return violationDate >= start && violationDate <= end;
    });
    return match?.riderId ?? null;
  }
}
