import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Taxonomy, TaxonomyEntity } from './entities/taxonomy.entity';
import { TaxonomyController } from './taxonomy.controller';
import { TaxonomyService } from './taxonomy.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Taxonomy.name, schema: TaxonomyEntity}])],
  controllers: [TaxonomyController],
  providers: [TaxonomyService],
})

export class TaxonomyModule {}
