import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';

export class BaseSkillsDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;

  @IsString()
  @IsNotEmpty()
  resourceName!: string;

  @IsOptional() 
  @IsString()
  emailOfResource?: string;

  @IsString()
  @IsNotEmpty()
  capability!: string;

  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @IsString()
  @IsNotEmpty()
  nameOfRespondent!: string;

  @IsObject()
  skills!: Record<string, number>; // Accept skill names mapped to skill levels
}

export class BulkUpdateSkillsDto {
  @ValidateNested({ each: true })
  @Type(() => BaseSkillsDto)
  data!: BaseSkillsDto[];
}
