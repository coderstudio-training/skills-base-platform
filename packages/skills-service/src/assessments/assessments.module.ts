import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@skills-base/shared';
import { AssessmentsController } from './controllers/assessments.controller';
import { PerformanceController } from './controllers/computation.controller';
import { SkillMatrixController } from './controllers/skill-matrix.controller';
import { AssessmentsService } from './services/assessments.service';
import { PerformanceService } from './services/computation.service';
import { SkillsMatrixService } from './services/re-skills-matrix.service';
import { SkillsMatrixxService } from './services/skills-matrix.service';
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
    SkillMatrixController,
  ],
  providers: [
    AssessmentsService,
    PerformanceService,
    SkillsMatrixService,
    SkillsMatrixxService,
    SkillsMatrixRepository,
  ],
  exports: [
    AssessmentsService,
    PerformanceService,
    SkillsMatrixService,
    SkillsMatrixxService,
  ],
})
export class AssessmentsModule {}
