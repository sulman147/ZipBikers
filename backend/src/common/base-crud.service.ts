import { NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { JsonDbService } from '../database/json-db.service';

export interface TimestampOptions {
  createdAt?: boolean;
  updatedAt?: boolean;
}

/**
 * Generic CRUD base class shared by every resource service (bikes, riders,
 * assignments, ...). Each concrete service only needs to declare which
 * collection it manages, the id prefix to use when generating new ids, and
 * whether the resource has createdAt/updatedAt fields per the API contract.
 *
 * IDs are generated as `<prefix>-<uuid>` per docs/API_CONTRACT.md
 * ("IDs are strings ... generated as `<prefix>-<uuid>` or similar").
 */
export abstract class BaseCrudService<T extends { id: string }> {
  protected abstract readonly collection: string;
  protected abstract readonly idPrefix: string;
  protected readonly timestamps: TimestampOptions = {};

  constructor(protected readonly db: JsonDbService) {}

  findAll(): T[] {
    return this.db.findAll<T>(this.collection);
  }

  findOne(id: string): T {
    const item = this.db.findById<T>(this.collection, id);
    if (!item) {
      throw new NotFoundException(`${this.resourceLabel()} with id "${id}" not found`);
    }
    return item;
  }

  create(dto: Partial<T>): T {
    const now = new Date().toISOString();
    const entity = {
      ...dto,
      id: `${this.idPrefix}-${uuidv4()}`,
    } as T;

    if (this.timestamps.createdAt) {
      (entity as any).createdAt = now;
    }
    if (this.timestamps.updatedAt) {
      (entity as any).updatedAt = now;
    }

    return this.db.create<T>(this.collection, entity);
  }

  update(id: string, patch: Partial<T>): T {
    this.findOne(id); // 404s if missing
    const patchToApply: Partial<T> = { ...patch };
    if (this.timestamps.updatedAt) {
      (patchToApply as any).updatedAt = new Date().toISOString();
    }
    // never allow the id to be overwritten via PATCH body
    delete (patchToApply as any).id;
    return this.db.update<T>(this.collection, id, patchToApply) as T;
  }

  remove(id: string): { success: true } {
    this.findOne(id); // 404s if missing
    this.db.remove(this.collection, id);
    return { success: true };
  }

  private resourceLabel(): string {
    return this.collection.replace(/s$/, '');
  }
}
