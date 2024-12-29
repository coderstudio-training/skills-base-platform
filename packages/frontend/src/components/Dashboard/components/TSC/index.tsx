'use client';

import DeletePopup from '@/components/Dashboard/components/TSC/DeletePopup';
import TSCForm from '@/components/Dashboard/components/TSC/TSCForm';
import TSCManagerHeader from '@/components/Dashboard/components/TSC/TSCManagerHeader';
import { BUSINESS_UNITS } from '@/components/Dashboard/constants';
import { useFilteredTSCs } from '@/components/Dashboard/hooks/useFilteredTSCs';
import { useTSCFormValidation } from '@/components/Dashboard/hooks/useTSCFormValidation';
import { useTSCOperations } from '@/components/Dashboard/hooks/useTSCOperations';
import { TSC, TSCManagerProps } from '@/components/Dashboard/types';
import { Card, CardContent } from '@/components/ui/card';
import { buildProficiency, getKeyFromValue } from '@/lib/utils';
import { useTSCManager } from '../../hooks/useTSCManager';
import TSCContent from './TSCContent';

export default function TaxonomyManager({
  selectedBusinessUnit = BUSINESS_UNITS.ALL,
  searchQuery = '',
}: TSCManagerProps) {
  const { data } = useTSCManager();

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
