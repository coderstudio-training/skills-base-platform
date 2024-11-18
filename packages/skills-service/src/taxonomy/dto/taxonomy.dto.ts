import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// technical skills
export class T_TaxonomyDTO extends BaseDto {
  @IsString()
  @IsNotEmpty({ message: 'document id must not be empty!' })
  docId!: string;

  @IsString()
  @IsNotEmpty()
  docRevisionId!: string;

  @IsString()
  @IsNotEmpty()
  docTitle!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsObject()
  @IsNotEmpty()
  proficiencyDescription!: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  abilities!: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  knowledge!: Record<string, any>;

  // Reserved for the collection name.
  @IsString()
  @IsNotEmpty()
  businessUnit!: string;

  @IsArray()
  @IsOptional()
  rangeOfApplication?: string[];
}

export class S_TaxonomyDTO extends BaseDto {
  @IsString()
  @IsNotEmpty({ message: 'document id must not be empty!' })
  docId!: string;

  @IsString()
  @IsNotEmpty()
  docRevisionId!: string;

  @IsString()
  @IsNotEmpty()
  docTitle!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsObject()
  @IsNotEmptyObject()
  profiencyDescription!: Record<string, string[]>;

  @IsObject()
  @IsNotEmptyObject()
  benchmark!: Record<string, string[]>;

  // Reserved for the collection name.
  @IsString()
  @IsNotEmpty()
  businessUnit!: string;
}

export class BulkUpsertTTaxonomyDTO {
  @ValidateNested({ each: true })
  @Type(() => T_TaxonomyDTO)
  data!: T_TaxonomyDTO[];
}

export class BulkUpsertSTaxonomyDTO {
  @ValidateNested({ each: true })
  @Type(() => T_TaxonomyDTO)
  data!: S_TaxonomyDTO[];
}
