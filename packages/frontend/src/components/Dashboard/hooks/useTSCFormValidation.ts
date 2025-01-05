import { SoftSkillProficiency, Taxonomy, TSCProficiency } from '@/components/Dashboard/types';
import { isTSC } from '@/lib/utils/taxonomy-utils';
import { useCallback, useState } from 'react';

export const useSkillFormValidation = () => {
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = useCallback((taxonomy: Taxonomy): boolean => {
    const errors: { [key: string]: string } = {};
    if (!taxonomy.title.trim()) errors.title = 'Title is required';
    if (!taxonomy.category.trim()) errors.category = 'Category is required';
    if (!taxonomy.description.trim()) errors.description = 'Description is required';
    if (taxonomy.proficiencies.length === 0)
      errors.proficiencies = 'At least one proficiency level is required';

    if (isTSC(taxonomy)) {
      taxonomy.proficiencies.forEach((prof: TSCProficiency, index: number) => {
        if (!prof.code.trim()) errors[`proficiency_${index}_code`] = 'Code is required';
        if (!prof.description.trim())
          errors[`proficiency_${index}_description`] = 'Description is required';
        if (prof.abilities.every(ab => ab.trim().length === 0)) {
          errors[`proficiency_${index}_abilities`] =
            'All ability columns are empty. At least one column is required';
        }
        if (prof.knowledge.every(ab => ab.trim().length === 0)) {
          errors[`proficiency_${index}_knowledge`] =
            'All knowledge columns are empty. At least one column is required';
        }
      });
    } else {
      taxonomy.proficiencies.forEach((prof: SoftSkillProficiency, index: number) => {
        if (prof.description.every(desc => desc.trim().length === 0)) {
          errors[`proficiency_${index}_description`] =
            'All description columns are empty. At least one column is required';
        }
        if (prof.benchmark.every(desc => desc.trim().length === 0)) {
          errors[`proficiency_${index}_benchmark`] =
            'All benchmark columns are empty. At least one column is required';
        }
      });
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  return { formErrors, validateForm, setFormErrors };
};
