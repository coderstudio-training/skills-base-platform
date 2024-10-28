import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsObject, IsOptional, isString, IsString, ValidateNested } from 'class-validator';

export class TaxonomyDTO extends BaseDto{
  @IsString()
  @IsNotEmpty({ message: 'document id must not be empty!'})
  DOC_Id!: string;

  @IsString()
  @IsNotEmpty()
  DOC_RevisionId!: string;

  @IsString()
  @IsNotEmpty()
  DOC_Title!: string;

  @IsString()
  @IsNotEmpty()
  TSC_Title!: string;

  @IsString()
  @IsNotEmpty()
  TSC_Category!: string;

  @IsString()
  @IsNotEmpty()
  TSC_Description!: string;

  @IsObject()
  @IsNotEmpty()
  TSC_ProficiencyDescription!: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  Abilities!: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  Knowledge!: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  BusinessUnit!: string;

  @IsArray()
  @IsOptional()
  RangeOfApplication?: string[];
}

export class BulkUpsertTaxonomyDTO {
    @ValidateNested({ each: true })
    @Type(() => TaxonomyDTO)
    data!: TaxonomyDTO[];
}