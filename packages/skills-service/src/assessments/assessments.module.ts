import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentsController } from './controllers/assessments.controller';
import { PerformanceController } from './controllers/computation.controller';
import { RequiredSkillsController } from './controllers/user-skills.controller';
import { AssessmentsService } from './services/assessments.service';
import { PerformanceService } from './services/computation.service';
import { UserSkillsService } from './services/user-skills.service';

@Module({
  imports: [MongooseModule],
  controllers: [
    AssessmentsController,
    PerformanceController,
    RequiredSkillsController,
  ],
  providers: [AssessmentsService, PerformanceService, UserSkillsService],
  exports: [AssessmentsService, PerformanceService, UserSkillsService],
})
export class AssessmentsModule {}
