'use client';

import { getKeyFromValue, validateTaxonomyData } from '@/components/TSC/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
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
}

const initialTSCs: TSC[] = [
  {
    id: '1',
    businessUnit: 'CLD',
    category: 'Development and Implementation',
    title: 'Clouding',
    description:
      'Apply quality standards to review performance through the planning and conduct of quality assurance audits to ensure that quality expectations are upheld. This includes the analysis of quality audit results and setting of follow-up actions to improve or enhance the quality of products, services or processes',
    proficiencies: [
      {
        level: '3',
        code: 'ICT-DIT-3010-1.1',
        description:
          'Conduct quality assurance (QA) audits and 1idate results and identify lapses and discrepancies',
        knowledge: [
          'Concept of quality assurance',
          'QA audit techniques, tools and standard processes',
          "Organization's quality management plan, processes and standards",
          'Basic measures of quality and performance',
        ],
        abilities: [
          'Apply quality standards to review performance of software or hardware product or service components',
          'Monitor day to day activities are in accordance to the requirements of the quality management plan',
          'Conduct QA audits based on a set plan',
          'Consolidate QA audit results and identify lapses or discrepancies',
          'Identify performance levels given existing quality assurance processes and areas for improvement',
          'Communicate changes or enhancements to QA processes or standards',
        ],
      },
      {
        level: '4',
        code: 'ICT-DIT-4010-1.1',
        description:
          'Implement quality performance guidelines and review the effectiveness of Quality Assurance (QA) processes',
        knowledge: [
          'QA audit principles, requirements and process planning',
          'Quality management techniques, tools and processes',
          'Interpretation and potential implications of various QA audit results',
          'Impact of QA processes and process changes on various business units or business processes',
        ],
        abilities: [
          'Implement quality performance guidelines, procedures and processes in the quality management plan, ensuring organization-wide understanding',
          'Manage QA audits in the organization',
          'Clarify uncertainties or queries on the QA audit results',
          'Analyze QA audit results and prioritize critical areas for further review and improvement',
          'Recommend changes to organization processes, to sustain or improve quality of products or services',
          'Review the effectiveness of quality assurance processes',
          'Propose improvements or changes to quality standards',
        ],
      },
      {
        level: '5',
        code: 'ICT-DIT-5010-1.1',
        description:
          'Establish quality benchmark standards and drive organizational commitment to ongoing quality through regular review of Quality Assurance (QA) audit results',
        knowledge: [
          'QA and quality management industry standards',
          'Industry best practices for quality assurance audits',
          'Internal and external requirements and trends, and their impact on quality assurance processes and standards',
          'QA audit philosophy and key underlying principles',
          'Short-term and long-term impact of QA processes and process changes on the organization',
        ],
        abilities: [
          'Establish quality benchmark standards based on alignment with external requirements, industry practices and internal business priorities',
          'Evaluate best practices against regular review of QA audit result',
          'Develop organization wide protocols and processes for QA audits, taking into account implications of emerging technological developments and external trends',
          'Resolve complex or significant disputes or disagreements on QA audit results and matters',
          'Review proposed future plans for improvements',
          'Spearhead enhancements to quality management plan, including quality performance guidelines, procedures and processes',
        ],
      },
    ],
    rangeOfApplication: [],
  },
];

export default function TSCManager({ selectedBusinessUnit = BUSINESS_UNITS.ALL }: TSCManagerProps) {
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
  } = useTSCOperations(selectedBusinessUnit, initialTSCs, setFormErrors, validateForm);

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
