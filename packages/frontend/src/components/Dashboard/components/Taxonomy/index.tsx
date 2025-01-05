'use client';

import DeletePopup from '@/components/Dashboard/components/Taxonomy/DeletePopup';
import SkillContent from '@/components/Dashboard/components/Taxonomy/SkillContent';
import SkillFooter from '@/components/Dashboard/components/Taxonomy/SkillFooter';
import SkillForm from '@/components/Dashboard/components/Taxonomy/SkillForm';
import SKillManagerHeader from '@/components/Dashboard/components/Taxonomy/SkillManagerHeader';
import { BUSINESS_UNITS, PROFICIENCY_LEVELS } from '@/components/Dashboard/constants';
import { useSkillFormValidation } from '@/components/Dashboard/hooks/useTSCFormValidation';
import { useTSCManager } from '@/components/Dashboard/hooks/useTSCManager';
import { useTSCOperations } from '@/components/Dashboard/hooks/useTSCOperations';
import {
  emptySSC,
  emptyTSC,
  SoftSkill,
  Taxonomy,
  TSC,
  TSCManagerProps,
} from '@/components/Dashboard/types';
import { Card, CardContent } from '@/components/ui/card';
import { getKeyFromValue } from '@/lib/utils/taxonomy-utils';
import { useMemo } from 'react';

export default function TaxonomyManager({
  selectedBusinessUnit = BUSINESS_UNITS.ALL,
  searchQuery = '',
}: TSCManagerProps) {
  const { data } = useTSCManager();
  const buKey = getKeyFromValue(selectedBusinessUnit);
  const { formErrors, setFormErrors, validateForm } = useSkillFormValidation();
  const {
    tscs,
    isDialogOpen,
    editingSkill,
    deleteConfirmOpen,
    setEditingSkill,
    setIsDialogOpen,
    setDeleteConfirmOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    confirmDelete,
  } = useTSCOperations(
    selectedBusinessUnit,
    data.sort((skill, taxonomy) => skill.title.localeCompare(taxonomy.title)) || ([] as Taxonomy[]),
    setFormErrors,
    validateForm,
  );

  const computedTargetSkill = useMemo(() => {
    if (editingSkill) return editingSkill;
    if (getKeyFromValue(selectedBusinessUnit as string) === 'ALL') {
      return {
        id: '',
        ...emptySSC,
        proficiencies: PROFICIENCY_LEVELS.map(() => ({
          type: 'soft',
          benchmark: [],
          description: [],
        })),
      } as SoftSkill;
    }
    return {
      id: '',
      ...emptyTSC,
      businessUnit: getKeyFromValue(selectedBusinessUnit as string),
    } as TSC;
  }, [editingSkill, selectedBusinessUnit]);

  return (
    <Card className="w-full">
      <SKillManagerHeader
        buCode={buKey}
        selectedBusinessUnit={selectedBusinessUnit}
        handleCreate={handleCreate}
      />
      <CardContent>
        <SkillContent
          filteredTaxonomies={tscs}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          searchQuery={searchQuery}
        />
      </CardContent>

      <SkillForm
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        targetSkill={computedTargetSkill}
        setTargetSkill={setEditingSkill}
        formErrors={formErrors}
        handleSave={handleSave}
      />
      <DeletePopup
        open={deleteConfirmOpen}
        setOpen={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
      />
      <SkillFooter />
    </Card>
  );
}
