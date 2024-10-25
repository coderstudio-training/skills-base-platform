import { Module } from '@nestjs/common';
import { TaxonomyService } from './taxonomy.service';
import { TaxonomyController } from './taxonomy.controller';

@Module({
  providers: [TaxonomyService],
  controllers: [TaxonomyController]
})
export class TaxonomyModule {}
