export interface TeamMember {
  employeeId: number;
  firstName: string;
  lastName: string;
  designation: string;
  email?: string;
  performanceScore?: number;
  managerName?: string;
  picture?: string;
}

export interface Taxonomy {
  docId: string;
  docRevisionId: string;
  docTitle: string;
  title: string;
  category: string;
  description: string;
  proficiencyDescription: Record<string, object>;
  abilities: Record<string, object>;
  knowledge: Record<string, object>;
  rangeOfApplication?: string[];
}
