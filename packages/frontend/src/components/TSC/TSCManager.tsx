'use client';

import { buildProficiency, getKeyFromValue, validateTaxonomyData } from '@/components/TSC/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { IBaseTaxonomy } from '@/lib/skills/types';
import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import DeletePopup from './components/DeletePopup';
import ProficiencyTable from './components/ProficiencyTable';
import TSCForm from './components/TSCForm';
import TSCManagerHeader from './components/TSCManagerHeader';
import { BUSINESS_UNITS } from './constants';
import { useFilteredTSCs } from './hooks/useFilteredTSCs';
import { useTSCFormValidation } from './hooks/useTSCFormValidation';
import { useTSCOperations } from './hooks/useTSCOperations';
import { TSC } from './types';

interface TSCManagerProps {
  selectedBusinessUnit?: string;
  data?: IBaseTaxonomy[];
}

export default function TSCManager({
  selectedBusinessUnit = BUSINESS_UNITS.ALL,
  data,
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
  const filteredTSCs = useFilteredTSCs(tscs, selectedBusinessUnit) ?? [];

  return (
    <Card className="w-full">
      <TSCManagerHeader
        buCode={buKey}
        selectedBusinessUnit={selectedBusinessUnit}
        handleCreate={handleCreate}
      />
      <CardContent>
        <div className="space-y-4">
          {filteredTSCs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No TSCs found for this business unit
            </div>
          ) : (
            filteredTSCs.map(tsc => (
              <Accordion type="single" collapsible key={tsc.id}>
                <AccordionItem value={tsc.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center space-x-4">
                        <span>{tsc.title || 'Untitled TSC'}</span>
                        <span className="text-sm text-muted-foreground">
                          {BUSINESS_UNITS[tsc.businessUnit]}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            handleEdit(tsc);
                          }}
                          aria-label="Edit TSC"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(tsc.id);
                          }}
                          aria-label="Delete TSC"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">TSC Category</h3>
                        <p>{tsc.category}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">TSC Description</h3>
                        <p>{tsc.description}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">TSC Proficiency Description</h3>
                        <ProficiencyTable proficiencies={tsc.proficiencies} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Range of Application</h3>
                        {tsc.rangeOfApplication.length > 0 &&
                        !validateTaxonomyData(tsc.rangeOfApplication[0]) ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {tsc.rangeOfApplication.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>No range of application specified</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))
          )}
        </div>
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
