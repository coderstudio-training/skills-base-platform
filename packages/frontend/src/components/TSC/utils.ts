import { BUSINESS_UNITS } from '@/components/TSC/constants';
import { BusinessUnit, TSCProficiency } from '@/components/TSC/types';
import { IBaseTaxonomy } from '@/lib/skills/types';

export function validateTextData(text: string): boolean {
  const regex = /^(n\/a|)$/i; // This regex matches "N/A" (case-insensitive) or an empty string

  return regex.test(text) || text.trim().length === 0;
}

export function getKeyFromValue(value: string): BusinessUnit {
  return Object.keys(BUSINESS_UNITS).find(key => BUSINESS_UNITS[key as BusinessUnit] === value) as
    | BusinessUnit
    | 'ALL';
}

export function getValueFromKey(key: BusinessUnit): string {
  return BUSINESS_UNITS[key];
}

export function buildRecord(tscData: Record<string, string[]>, index: string): string[] {
  const knowledges: string[] = [];

  tscData[index].forEach(data => {
    if (validateTextData(data)) {
      return;
    }
    knowledges.push(data);
  });

  return knowledges;
}

export function buildProficiency(tsc: IBaseTaxonomy): TSCProficiency[] {
  const proficiencies: TSCProficiency[] = [];

  Object.entries(tsc.proficiencyDescription).forEach(([key, value]) => {
    proficiencies.push({
      level: key.toString().at(-1),
      code: validateTextData(value[0]) ? '' : value[0],
      description: validateTextData(value[1]) ? '' : value[1],
      knowledge: buildRecord(tsc.knowledge, key),
      abilities: buildRecord(tsc.abilities, key),
    } as TSCProficiency);
  });

  return proficiencies;
}
