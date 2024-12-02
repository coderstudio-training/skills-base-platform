export interface IBulkUpsertDTO {
  data: ITaxonomyDTO[];
}

export interface IBaseTaxonomy {
  docTitle: string;
  docId: string;
  docRevisionId: string;
  category: string;
  title: string;
  description: string;
  proficiencyDescription: Record<string, string[]>;
  abilities: Record<string, string[]>;
  knowledge: Record<string, string[]>;
  rangeOfApplication?: string[];
}

export interface ITechnicalTaxonomy {
  data: IBaseTaxonomy[];
}

export interface ITaxonomyDTO extends IBaseTaxonomy {
  businessUnit: string;
}

export interface ITaxonomyResponse {
  updatedCount: number;
  errors: string[];
}
