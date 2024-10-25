// self-skills.module.ts (or the appropriate module file)
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillsController } from './assessments.controller';
import { SkillsService } from './assessments.service';
import { ManagerSkills, ManagerSkillsSchema, SelfSkills, SelfSkillsSchema } from './entities/assessments.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SelfSkills.name, schema: SelfSkillsSchema }]),
    MongooseModule.forFeature([{ name: ManagerSkills.name, schema: ManagerSkillsSchema }]),
  ],
  controllers: [SkillsController],
  providers: [SkillsService],
})
export class SelfSkillsModule {}
