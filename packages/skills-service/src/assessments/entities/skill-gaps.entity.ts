import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class SkillGaps extends BaseEntity {
  @ApiProperty({
    description: 'Unique email address of the resource',
    example: 'john.doe@company.com',
    uniqueItems: true,
  })
  @Prop({ required: true, unique: true, index: true })
  emailAddress!: string;

  @ApiProperty({
    description: 'Name of the resource being evaluated',
    example: 'John Doe',
  })
  @Prop({ required: true })
  nameOfResource!: string;

  @ApiProperty({
    description: 'Current career level of the resource',
    example: 'Senior Developer',
  })
  @Prop({ required: true })
  careerLevel!: string;

  @ApiProperty({
    description: 'Capability category being evaluated',
    example: 'Technical Skills',
  })
  @Prop({ required: true })
  capability!: string;

  @ApiProperty({
    description: 'Map of skills and their average scores from all assessments',
    example: {
      JavaScript: 3.5,
      TypeScript: 4.0,
      'Node.js': 3.8,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @Prop({ type: Map, of: Number, required: true })
  skillAverages!: Map<string, number>;

  @ApiProperty({
    description: 'Map of skills and their gaps compared to required level',
    example: {
      JavaScript: -0.5, // negative indicates below required level
      TypeScript: 1.0, // positive indicates above required level
      'Node.js': 0.0, // zero indicates meeting required level
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @Prop({ type: Map, of: Number, required: true })
  skillGaps!: Map<string, number>;

  @ApiProperty({
    description: 'Timestamp of last update',
    type: Date,
    default: 'Current timestamp',
  })
  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const SkillGapsSchema = SchemaFactory.createForClass(SkillGaps);
