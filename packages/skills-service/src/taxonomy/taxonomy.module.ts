import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonomyService } from './taxonomy.service';

@Module({
  imports: [MongooseModule],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
})

export class TaxonomyModule {}
