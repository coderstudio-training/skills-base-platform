import { IsString, IsArray, IsOptional, IsObject, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class TaxonomyDTO {
  @IsString()
  @IsNotEmpty({ message: 'document id must not be empty!'})
  doc_Id: string;

  @IsString()
  @IsNotEmpty()
  doc_revisionId: string;

  @IsString()
  @IsNotEmpty()
  doc_title: string;

  @IsString()
  @IsNotEmpty()
  TSCTitle: string;

  @IsString()
  @IsNotEmpty()
  TSCCategory: string;

  @IsString()
  @IsNotEmpty()
  TSCDescription: string;

  @IsObject()
  @IsNotEmpty()
  TSCProficiencyDescription: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  Abilities: Record<string, any>;

  @IsObject()
  @IsNotEmpty()
  Knowledge: Record<string, any>;

  @IsArray()
  @IsOptional()
  RangeOfApplication?: string[];
}

export class BulkUpsertTaxonomyDTO {
    @ValidateNested({ each: true })
    @Type(() => TaxonomyDTO)
    data: TaxonomyDTO[];
}