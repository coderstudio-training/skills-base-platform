import { BUSINESS_UNITS } from '@/components/TSC/constants';

export interface TSCProficiency {
  level: string;
  code: string;
  description: string;
  knowledge: string[];
  abilities: string[];
}

export interface TSC {
  id: string;
  businessUnit: BusinessUnit;
  category: string;
  title: string;
  description: string;
  proficiencies: TSCProficiency[];
  rangeOfApplication: string[];
}

export const emptyTSC: Omit<TSC, 'id' | 'businessUnit'> = {
  category: '',
  title: '',
  description: '',
  proficiencies: [],
  rangeOfApplication: [],
};

export const emptyProficiency: TSCProficiency = {
  level: '',
  code: '',
  description: '',
  knowledge: [],
  abilities: [],
};

export type BusinessUnit = keyof typeof BUSINESS_UNITS;
