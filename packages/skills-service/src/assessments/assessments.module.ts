import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsController } from './controllers/assessments.controller';
import { PerformanceController } from './controllers/computation.controller';
import { SkillMatrixController } from './controllers/skill-matrix.controller';
import { RequiredSkillsController } from './controllers/user-skills.controller';
import { AssessmentsService } from './services/assessments.service';
import { PerformanceService } from './services/computation.service';
import { SkillsMatrixService } from './services/skills-matrix.service';
import { UserSkillsService } from './services/user-skills.service';

@Module({
  imports: [MongooseModule],
  controllers: [
    AssessmentsController,
    PerformanceController,
    RequiredSkillsController,
    SkillMatrixController,
  ],
  providers: [
    AssessmentsService,
    PerformanceService,
    UserSkillsService,
    SkillsMatrixService,
  ],
  exports: [
    AssessmentsService,
    PerformanceService,
    UserSkillsService,
    SkillsMatrixService,
  ],
})
export class AssessmentsModule {}
