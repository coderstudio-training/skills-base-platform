import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SelfSkillsController } from './assessments.controller';
import { SelfSkillsService } from './assessments.service';
import {
  SelfSkills,
  SelfSkillsSchema,
} from './entities/assessments.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SelfSkills.name, schema: SelfSkillsSchema },
    ]),
  ],
  controllers: [SelfSkillsController],
  providers: [SelfSkillsService],
  exports: [SelfSkillsService],
})
export class SelfSkillsModule {}
