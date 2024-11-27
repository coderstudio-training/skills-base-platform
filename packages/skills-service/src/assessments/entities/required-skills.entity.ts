import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class RequiredSkills extends BaseEntity {
  @ApiProperty({
    description: 'The capability category for which skills are defined',
    example: 'Technical Skills',
    required: true,
  })
  @Prop({ required: true })
  capability!: string;

  @ApiProperty({
    description: 'Career level for which these skill requirements apply',
    example: 'Senior Developer',
    required: true,
  })
  @Prop({ required: true })
  careerLevel!: string;

  @ApiProperty({
    description:
      'Map of skills and their required proficiency levels for this career level',
    example: {
      JavaScript: 4,
      TypeScript: 4,
      'Node.js': 3,
      React: 4,
      MongoDB: 3,
    },
    type: 'object',
    additionalProperties: {
      type: 'number',
      minimum: 1,
      maximum: 6,
      description: 'Proficiency level (1-6 scale)',
    },
  })
  @Prop({ type: Object, required: true })
  requiredSkills?: Record<string, number>;

  @ApiProperty({
    description: 'Timestamp when the skill requirements were last updated',
    type: Date,
    default: 'Current timestamp',
  })
  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const RequiredSkillsSchema =
  SchemaFactory.createForClass(RequiredSkills);

// Create compound index after schema creation
RequiredSkillsSchema.index({ capability: 1, careerLevel: 1 }, { unique: true });
