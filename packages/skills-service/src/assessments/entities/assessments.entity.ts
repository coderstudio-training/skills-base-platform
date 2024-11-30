import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '@skills-base/shared';

@Schema()
export class Assessments extends BaseEntity {
  @ApiProperty({
    description: 'Timestamp of the assessment',
    type: Date,
  })
  @Prop({ required: true })
  timestamp!: Date;

  @ApiProperty({
    description: 'Email address of the person being assessed',
    example: 'john.doe@company.com',
  })
  @Prop({ required: true })
  emailAddress!: string;

  @ApiProperty({
    description: 'Name of the resource being assessed',
    example: 'John Doe',
  })
  @Prop({ required: true })
  nameOfResource!: string;

  @ApiPropertyOptional({
    description: 'Email of the resource being assessed (optional)',
    example: 'john.doe@company.com',
  })
  @Prop({ required: false })
  emailOfResource?: string;

  @ApiProperty({
    description: 'Career level of the resource being assessed',
    example: 'Senior Developer',
  })
  @Prop({ required: true })
  careerLevelOfResource!: string;

  @ApiProperty({
    description: 'Name of the person completing the assessment',
    example: 'Jane Smith',
  })
  @Prop({ required: true })
  nameOfRespondent!: string;

  @ApiProperty({
    description: 'Capability category being assessed',
    example: 'Technical Skills',
  })
  @Prop({ required: true })
  capability!: string;

  @ApiProperty({
    description: 'Map of skills and their corresponding scores',
    example: {
      JavaScript: 4,
      TypeScript: 3,
      'Node.js': 5,
    },
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  @Prop({ type: Map, of: Number, default: {} })
  skills!: Record<string, number>;

  @ApiProperty({
    description: 'Last updated timestamp',
    type: Date,
    default: 'Current timestamp',
  })
  @Prop({ default: Date.now })
  lastUpdated!: Date;
}

export const BaseSkillsSchema = SchemaFactory.createForClass(Assessments);

@Schema()
export class SelfAssessments extends Assessments {
  @ApiProperty({
    description: 'Unique email address of the person doing self-assessment',
    example: 'john.doe@company.com',
    uniqueItems: true,
  })
  @Prop({ required: true, unique: true, index: true })
  emailAddress!: string;
}

export const SelfAssessmentSchema =
  SchemaFactory.createForClass(SelfAssessments);

@Schema()
export class ManagerAssessment extends Assessments {
  @ApiProperty({
    description:
      'Unique email address of the resource being assessed by manager',
    example: 'employee@company.com',
    uniqueItems: true,
  })
  @Prop({ required: true, unique: true, index: true })
  emailOfResource!: string;
}

export const ManagerAssessmentSchema =
  SchemaFactory.createForClass(ManagerAssessment);

@Schema()
export class AverageAssessments extends Assessments {
  @ApiProperty({
    description: 'Unique email address for averaged assessment results',
    example: 'john.doe@company.com',
    uniqueItems: true,
  })
  @Prop({ required: true, unique: true, index: true })
  emailAddress!: string;
}

export const AverageAssessmentsSchema =
  SchemaFactory.createForClass(AverageAssessments);
