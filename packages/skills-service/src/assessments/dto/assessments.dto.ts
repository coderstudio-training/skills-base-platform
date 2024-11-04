import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BaseAssessmentDto {
  @IsNotEmpty()
  timestamp!: Date;

  @IsEmail()
  @IsNotEmpty()
  emailAddress!: string;

  @IsString()
  @IsNotEmpty()
  nameOfResource!: string;

  @IsOptional()
  @IsEmail() // Validate as an email
  emailOfResource?: string;
  
  @IsString()
  @IsNotEmpty()
  careerLevelOfResource!: string;
  
  @IsString()
  @IsNotEmpty()
  nameOfRespondent!: string;
  
  @IsString()
  @IsNotEmpty()
  capability!: string;

  @IsObject()
  skills!: Record<string, number>; 
}

export class BulkUpdateAssessmentsDto {
  @ValidateNested({ each: true })
  @Type(() => BaseAssessmentDto)
  data!: BaseAssessmentDto[];
}
