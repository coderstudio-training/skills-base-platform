import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsController } from './controllers/assessments.controller';
import { PerformanceController } from './controllers/computation.controller';
import { SkillMatrixController } from './controllers/skill-matrix.controller';
import { AssessmentsService } from './services/assessments.service';
import { PerformanceService } from './services/computation.service';
import { SkillsMatrixService } from './services/skills-matrix.service';

@Module({
  imports: [MongooseModule],
  controllers: [
    AssessmentsController,
    PerformanceController,
    SkillMatrixController,
  ],
  providers: [AssessmentsService, PerformanceService, SkillsMatrixService],
  exports: [AssessmentsService, PerformanceService, SkillsMatrixService],
})
export class AssessmentsModule {}
