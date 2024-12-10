import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@skills-base/shared';
import { AssessmentsController } from './controllers/assessments.controller';
import { PerformanceController } from './controllers/computation.controller';
import { SkillsMatrixController } from './controllers/re-skills-matrix.controller';
import { AssessmentsService } from './services/assessments.service';
import { PerformanceService } from './services/computation.service';
import { SkillsMatrixService } from './services/re-skills-matrix.service';
import { SkillsMatrixRepository } from './skills-matrix.repository';

@Module({
  imports: [
    MongooseModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 3600000, // 1 hour default TTL
      max: 100, // maximum number of items in cache
    }),
  ],
  controllers: [
    AssessmentsController,
    PerformanceController,
    SkillsMatrixController,
  ],
  providers: [
    AssessmentsService,
    PerformanceService,
    SkillsMatrixService,
    SkillsMatrixRepository,
  ],
  exports: [AssessmentsService, PerformanceService, SkillsMatrixService],
})
export class AssessmentsModule {}
