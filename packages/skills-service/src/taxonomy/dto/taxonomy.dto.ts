import { BaseDto } from '@skills-base/shared';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TaxonomyDTO extends BaseDto {
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

export class BulkUpsertTaxonomyDTO {
  @ValidateNested({ each: true })
  @Type(() => TaxonomyDTO)
  data!: TaxonomyDTO[];
}
