import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class SkillGap extends BaseEntity {
  @ApiProperty({
    description: 'Email address of the employee',
    example: 'john.doe@company.com',
  })
  @Prop({ required: true })
  emailAddress!: string;

  @ApiProperty({
    description: 'Name of the employee',
    example: 'John Doe',
  })
  @Prop({ required: true })
  name!: string;

  @ApiProperty({
    description: 'Current career level',
    example: 'Professional III',
  })
  @Prop({ required: true })
  careerLevel!: string;

  @ApiProperty({
    description: 'Map of skill names to gap levels',
    example: {
      'Software Testing': -1,
      'Test Automation': -2,
      'Test Planning': 0,
    },
  })
  @Prop({ type: Object })
  skillGaps!: Record<string, number>;

  @ApiProperty({
    description: 'Date when the skill gaps were computed',
    example: '2024-11-27T10:00:00.000Z',
  })
  @Prop({ type: Date, default: Date.now })
  computedDate!: Date;
}

export const SkillGapSchema = SchemaFactory.createForClass(SkillGap);
