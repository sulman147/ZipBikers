import { Global, Module } from '@nestjs/common';
import { JsonDbService } from './json-db.service';

/**
 * Global module so any feature module can inject JsonDbService without
 * re-importing DatabaseModule everywhere.
 */
@Global()
@Module({
  providers: [JsonDbService],
  exports: [JsonDbService],
})
export class DatabaseModule {}
