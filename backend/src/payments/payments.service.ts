import { BadRequestException, Injectable } from '@nestjs/common';
import { BaseCrudService } from '../common/base-crud.service';
import { Assignment, Payment, PaymentStatus } from '../common/types';
import { JsonDbService } from '../database/json-db.service';

/**
 * Payments carry rules that must hold no matter which client (this web app,
 * a future mobile app, ...) creates or edits them, so they live here instead
 * of in each frontend:
 *  - bikeId/riderId always come from the linked assignment, never the client
 *  - amountDue defaults to the assignment's monthlyRent when not supplied
 *  - status is always derived from amountPaid vs amountDue, never set directly
 *  - paidDate is set to today the moment amountPaid becomes > 0, and cleared
 *    back to null if a payment is edited down to 0
 */
@Injectable()
export class PaymentsService extends BaseCrudService<Payment> {
  protected readonly collection = 'payments';
  protected readonly idPrefix = 'payment';
  // Payment has no createdAt/updatedAt fields per the API contract.

  constructor(db: JsonDbService) {
    super(db);
  }

  private computeStatus(amountDue: number, amountPaid: number): PaymentStatus {
    if (amountPaid <= 0) return 'UNPAID';
    if (amountPaid >= amountDue) return 'PAID';
    return 'PARTIAL';
  }

  private getAssignment(assignmentId: string): Assignment {
    const assignment = this.db.findById<Assignment>('assignments', assignmentId);
    if (!assignment) {
      throw new BadRequestException(`Assignment with id "${assignmentId}" not found`);
    }
    return assignment;
  }

  create(dto: Partial<Payment>): Payment {
    const assignment = this.getAssignment(dto.assignmentId as string);
    const amountDue = dto.amountDue ?? assignment.monthlyRent;
    const amountPaid = dto.amountPaid ?? 0;

    return super.create({
      ...dto,
      bikeId: assignment.bikeId,
      riderId: assignment.riderId,
      amountDue,
      amountPaid,
      status: this.computeStatus(amountDue, amountPaid),
      paidDate: amountPaid > 0 ? dto.paidDate ?? new Date().toISOString().slice(0, 10) : null,
    });
  }

  update(id: string, patch: Partial<Payment>): Payment {
    const existing = this.findOne(id);
    const assignment = this.getAssignment(patch.assignmentId ?? existing.assignmentId);
    const amountDue = patch.amountDue ?? existing.amountDue;
    const amountPaid = patch.amountPaid ?? existing.amountPaid;

    let paidDate = existing.paidDate;
    if (amountPaid > 0) {
      paidDate = patch.paidDate ?? existing.paidDate ?? new Date().toISOString().slice(0, 10);
    } else {
      paidDate = null;
    }

    return super.update(id, {
      ...patch,
      bikeId: assignment.bikeId,
      riderId: assignment.riderId,
      amountDue,
      amountPaid,
      status: this.computeStatus(amountDue, amountPaid),
      paidDate,
    });
  }
}
