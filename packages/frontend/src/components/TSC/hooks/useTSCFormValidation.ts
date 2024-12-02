import { TSC, TSCProficiency } from '@/components/TSC/types';
import { useCallback, useState } from 'react';

export const useTSCFormValidation = () => {
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = useCallback((tsc: TSC): boolean => {
    const errors: { [key: string]: string } = {};
    if (!tsc.title.trim()) errors.title = 'Title is required';
    if (!tsc.category.trim()) errors.category = 'Category is required';
    if (!tsc.description.trim()) errors.description = 'Description is required';
    if (tsc.proficiencies.length === 0)
      errors.proficiencies = 'At least one proficiency level is required';

    tsc.proficiencies.forEach((prof: TSCProficiency, index: number) => {
      if (!prof.code.trim()) errors[`proficiency_${index}_code`] = 'Code is required';
      if (!prof.description.trim())
        errors[`proficiency_${index}_description`] = 'Description is required';
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  return { formErrors, validateForm, setFormErrors };
};
