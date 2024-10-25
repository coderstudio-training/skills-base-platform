import { IsString, IsArray, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TaxonomyDTO {
  @IsString()
  doc_Id: string;

  @IsString()
  doc_revisionId: string;

  @IsString()
  doc_title: string;

  @IsString()
  TSCTitle: string;

  @IsString()
  TSCCategory: string;

  @IsString()
  TSCDescription: string;

  @IsObject()
  TSCProficiencyDescription: Record<string, any>;

  @IsObject()
  Abilities: Record<string, any>;

  @IsObject()
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