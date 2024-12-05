'use client';

import DeletePopup from '@/blocks/Dashboard/components/TSC/DeletePopup';
import TSCForm from '@/blocks/Dashboard/components/TSC/TSCForm';
import TSCManagerHeader from '@/blocks/Dashboard/components/TSC/TSCManagerHeader';
import { BUSINESS_UNITS } from '@/blocks/Dashboard/constants';
import { useFilteredTSCs } from '@/blocks/Dashboard/hooks/useFilteredTSCs';
import { useTSCFormValidation } from '@/blocks/Dashboard/hooks/useTSCFormValidation';
import { useTSCOperations } from '@/blocks/Dashboard/hooks/useTSCOperations';
import { TSC, TSCManagerProps } from '@/blocks/Dashboard/types';
import { Card, CardContent } from '@/blocks/ui/card';
import { buildProficiency, getKeyFromValue } from '@/lib/utils';
import TSCContent from './TSCContent';

export default function TaxonomyManager({
  selectedBusinessUnit = BUSINESS_UNITS.ALL,
  data,
  searchQuery = '',
}: TSCManagerProps) {
  const newTSCs = data?.map(tsc => ({
    id: tsc.docId,
    businessUnit: 'QA',
    category: tsc.category,
    title: tsc.title,
    description: tsc.description,
    proficiencies: buildProficiency(tsc),
    rangeOfApplication: tsc.rangeOfApplication,
  })) as TSC[];

  const buKey = getKeyFromValue(selectedBusinessUnit);
  const { formErrors, setFormErrors, validateForm } = useTSCFormValidation();
  const {
    tscs,
    isDialogOpen,
    editingTSC,
    deleteConfirmOpen,
    setEditingTSC,
    setIsDialogOpen,
    setDeleteConfirmOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    confirmDelete,
  } = useTSCOperations(selectedBusinessUnit, newTSCs || ([] as TSC[]), setFormErrors, validateForm);

  const filteredTSCs = useFilteredTSCs(tscs, selectedBusinessUnit, searchQuery);

  return (
    <Card className="w-full">
      <TSCManagerHeader
        buCode={buKey}
        selectedBusinessUnit={selectedBusinessUnit}
        handleCreate={handleCreate}
      />
      <CardContent>
        <TSCContent
          filteredTSCs={filteredTSCs}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          searchQuery={searchQuery}
        />
      </CardContent>

      <TSCForm
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        targetTSC={editingTSC}
        setTargetTSC={setEditingTSC}
        formErrors={formErrors}
        handleSave={handleSave}
      />
      <DeletePopup
        open={deleteConfirmOpen}
        setOpen={setDeleteConfirmOpen}
        onConfirm={confirmDelete}
      />
    </Card>
  );
}
