import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsController } from './controllers/assessments.controller';
import { PerformanceController } from './controllers/computation.controller';
import { RequiredSkillsController } from './controllers/required-skills.controller';
import { AssessmentsService } from './services/assessments.service';
import { PerformanceService } from './services/computation.service';
import { RequiredSkillsService } from './services/required-skills.service';

@Module({
  imports: [MongooseModule],
  controllers: [
    AssessmentsController,
    PerformanceController,
    RequiredSkillsController,
  ],
  providers: [AssessmentsService, PerformanceService, RequiredSkillsService],
  exports: [AssessmentsService, PerformanceService, RequiredSkillsService],
})
export class AssessmentsModule {}
