import { IsNotEmpty, IsObject, IsString } from 'class-validator';

export class RequiredSkillsDto {
  @IsString()
  @IsNotEmpty()
  careerLevel!: string;

  @IsObject()
  skills!: Record<string, number>;
}

export class BulkUpdateRequiredSkillsDto {
  @IsNotEmpty()
  data!: RequiredSkillsDto[];
}
