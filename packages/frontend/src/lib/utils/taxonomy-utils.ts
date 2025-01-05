import { BUSINESS_UNITS } from '@/components/Dashboard/constants';
import {
  BusinessUnit,
  IBaseTaxonomy,
  ISoftTaxonomy,
  SoftSkill,
  SoftSkillProficiency,
  Taxonomy,
  TSC,
  TSCProficiency,
} from '@/components/Dashboard/types';
import { validateTextData } from '@/lib/utils';

// Type guards
export function isIBaseTaxonomy(skill: IBaseTaxonomy | ISoftTaxonomy): skill is IBaseTaxonomy {
  return 'abilities' in skill && 'knowledge' in skill;
}

export function isTSC(taxonomy: Taxonomy): taxonomy is TSC {
  return taxonomy.type === 'technical';
}

export function isSoftSkill(taxonomy: Taxonomy): taxonomy is SoftSkill {
  return taxonomy.type === 'soft';
}

export function filterBU(tscs: TSC[], selectedBusinessUnit: string): TSC[] {
  return tscs.filter(tsc => tsc.businessUnit === getKeyFromValue(selectedBusinessUnit));
}

export function getKeyFromValue(value: string): BusinessUnit {
  return Object.keys(BUSINESS_UNITS).find(key => BUSINESS_UNITS[key as BusinessUnit] === value) as
    | BusinessUnit
    | 'ALL';
}

export function getValueFromKey(key: BusinessUnit): string {
  return BUSINESS_UNITS[key];
}

export function buildRecord(skill: Record<string, string[]>, index: string): string[] {
  const knowledges: string[] = [];

  skill[index].forEach(data => {
    if (validateTextData(data)) {
      return;
    }
    knowledges.push(data);
  });

  return knowledges;
}

export function buildProficiency(
  skill: IBaseTaxonomy | ISoftTaxonomy,
): TSCProficiency[] | SoftSkillProficiency[] {
  if (isIBaseTaxonomy(skill)) {
    // Handle technical skill
    return Object.entries(skill.proficiencyDescription).map(([key, value]) => ({
      level: key.toString().at(-1),
      code: validateTextData(value[0]) ? '' : value[0],
      description: validateTextData(value[1]) ? '' : value[1],
      knowledge: buildRecord(skill.knowledge, key),
      abilities: buildRecord(skill.abilities, key),
    })) as TSCProficiency[];
  } else {
    // Handle soft skill
    return Object.entries(skill.benchmark).map(([key]) => ({
      benchmark: buildRecord(skill.benchmark, key),
      description: buildRecord(skill.proficiencyDescription, key),
    })) as SoftSkillProficiency[];
  }
}
