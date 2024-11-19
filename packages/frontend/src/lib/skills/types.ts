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
  proficiencyDescription: object;
  abilities: object;
  knowledge: object;
  rangeOfApplication?: string[];
}

export interface ITaxonomyDTO extends IBaseTaxonomy {
  businessUnit: string;
}

export interface ITaxonomyResponse {
  updatedCount: number;
  errors: string[];
}
