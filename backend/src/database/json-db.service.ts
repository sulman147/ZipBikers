import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { Database } from '../common/types';
import { buildSeedData } from './seed';

/**
 * JsonDbService - a tiny "database" backed by a single JSON file
 * (backend/data/db.json), one array per collection.
 *
 * On module init:
 *  - if data/db.json is missing, it is created and seeded via buildSeedData()
 *  - otherwise the existing file is loaded into memory as-is
 *
 * Writes mutate the in-memory object then schedule a debounced save to
 * disk, so data survives process restarts without hitting the filesystem
 * on every single mutation.
 */
@Injectable()
export class JsonDbService implements OnModuleInit {
  private readonly logger = new Logger(JsonDbService.name);
  private readonly dbPath = path.join(process.cwd(), 'data', 'db.json');
  private data: Record<string, any[]> = {};
  private saveTimer: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.load();
  }

  private load() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.dbPath)) {
      this.logger.log(`No db.json found at ${this.dbPath} - seeding initial data...`);
      this.data = buildSeedData() as unknown as Record<string, any[]>;
      this.persistNow();
      this.logger.log('Seed data written to db.json');
      return;
    }

    try {
      const raw = fs.readFileSync(this.dbPath, 'utf-8');
      this.data = JSON.parse(raw);
      this.logger.log(`Loaded db.json from ${this.dbPath}`);
    } catch (err) {
      this.logger.error('Failed to parse existing db.json, re-seeding.', err as Error);
      this.data = buildSeedData() as unknown as Record<string, any[]>;
      this.persistNow();
    }
  }

  private persistNow() {
    fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  /** Debounced save so bursts of writes don't hammer the disk. */
  private scheduleSave() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = setTimeout(() => {
      this.persistNow();
      this.saveTimer = null;
    }, 150);
  }

  private getCollection<T>(name: string): T[] {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    return this.data[name] as T[];
  }

  findAll<T>(collection: string): T[] {
    return [...this.getCollection<T>(collection)];
  }

  findById<T>(collection: string, id: string): T | undefined {
    return this.getCollection<T>(collection).find((item: any) => item.id === id);
  }

  findOneBy<T>(collection: string, predicate: (item: T) => boolean): T | undefined {
    return this.getCollection<T>(collection).find(predicate);
  }

  findManyBy<T>(collection: string, predicate: (item: T) => boolean): T[] {
    return this.getCollection<T>(collection).filter(predicate);
  }

  create<T>(collection: string, entity: T): T {
    this.getCollection<T>(collection).push(entity);
    this.scheduleSave();
    return entity;
  }

  update<T>(collection: string, id: string, patch: Partial<T>): T | undefined {
    const arr = this.getCollection<any>(collection);
    const idx = arr.findIndex((item) => item.id === id);
    if (idx === -1) return undefined;
    arr[idx] = { ...arr[idx], ...patch };
    this.scheduleSave();
    return arr[idx];
  }

  remove(collection: string, id: string): boolean {
    const arr = this.getCollection<any>(collection);
    const idx = arr.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  /** Force an immediate synchronous flush to disk (used sparingly, e.g. before shutdown). */
  flush() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    this.persistNow();
  }

  /** Deep-copy snapshot of every collection, for admin backup/export. */
  exportAll(): Record<string, any[]> {
    return JSON.parse(JSON.stringify(this.data));
  }

  /**
   * Atomically replace every collection with the given data and flush to
   * disk immediately (no debounce window). Used by the admin import
   * endpoint to make Render's db.json an exact copy of an external source.
   * Returns a per-collection record count for verification.
   */
  importAll(next: Record<string, unknown>): Record<string, number> {
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      throw new BadRequestException('Import payload must be an object mapping collection name to an array of records');
    }
    for (const [key, value] of Object.entries(next)) {
      if (!Array.isArray(value)) {
        throw new BadRequestException(`Collection "${key}" must be an array`);
      }
    }
    this.data = JSON.parse(JSON.stringify(next));
    this.flush();

    const summary: Record<string, number> = {};
    for (const [key, value] of Object.entries(this.data)) {
      summary[key] = (value as unknown[]).length;
    }
    return summary;
  }
}
