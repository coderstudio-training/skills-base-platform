import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Pencil, PlusCircle, Save, Trash2 } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

const BUSINESS_UNITS = {
  ALL: 'All Business Units',
  QA: 'Software QA Services',
  DEV: 'Software Development',
  DATA: 'Data Science',
  CLOUD: 'Cloud Services',
  SEC: 'Cybersecurity',
} as const;

type BusinessUnit = keyof typeof BUSINESS_UNITS;

interface TSCProficiency {
  level: string;
  code: string;
  description: string;
  knowledge: string[];
  abilities: string[];
}

interface TSC {
  id: string;
  businessUnit: BusinessUnit;
  category: string;
  title: string;
  description: string;
  proficiencies: TSCProficiency[];
  rangeOfApplication: string[];
}

const PROFICIENCY_LEVELS = ['1', '2', '3', '4', '5', '6'];

const initialTSCs: TSC[] = [
  {
    id: '1',
    businessUnit: 'QA',
    category: 'Development and Implementation',
    title: 'Quality Assurance',
    description:
      'Apply quality standards to review performance through the planning and conduct of quality assurance audits to ensure that quality expectations are upheld. This includes the analysis of quality audit results and setting of follow-up actions to improve or enhance the quality of products, services or processes',
    proficiencies: [
      {
        level: '3',
        code: 'ICT-DIT-3010-1.1',
        description:
          'Conduct quality assurance (QA) audits and consolidate results and identify lapses and discrepancies',
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

const emptyTSC: Omit<TSC, 'id' | 'businessUnit'> = {
  category: '',
  title: '',
  description: '',
  proficiencies: [],
  rangeOfApplication: [],
};

const emptyProficiency: TSCProficiency = {
  level: '',
  code: '',
  description: '',
  knowledge: [],
  abilities: [],
};

interface TSCManagerProps {
  selectedBusinessUnit?: BusinessUnit;
}

export function TaxonomyManager({ selectedBusinessUnit = 'ALL' }: TSCManagerProps) {
  const [tscs, setTSCs] = useState<TSC[]>(initialTSCs);
  const [editingTSC, setEditingTSC] = useState<TSC | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tscToDelete, setTscToDelete] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const filteredTSCs = useMemo(
    () =>
      selectedBusinessUnit === 'ALL'
        ? tscs
        : tscs.filter(tsc => tsc.businessUnit === selectedBusinessUnit),
    [tscs, selectedBusinessUnit],
  );

  const validateForm = useCallback((tsc: TSC): boolean => {
    const errors: { [key: string]: string } = {};

    if (!tsc.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!tsc.category.trim()) {
      errors.category = 'Category is required';
    }
    if (!tsc.description.trim()) {
      errors.description = 'Description is required';
    }
    if (tsc.proficiencies.length === 0) {
      errors.proficiencies = 'At least one proficiency level is required';
    }

    tsc.proficiencies.forEach((prof, index) => {
      if (!prof.code.trim()) {
        errors[`proficiency_${index}_code`] = 'Code is required';
      }
      if (!prof.description.trim()) {
        errors[`proficiency_${index}_description`] = 'Description is required';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const handleCreate = useCallback(() => {
    setFormErrors({});
    setEditingTSC({ ...emptyTSC, id: '', businessUnit: selectedBusinessUnit });
    setIsDialogOpen(true);
  }, [selectedBusinessUnit]);

  const handleEdit = useCallback((tsc: TSC) => {
    setFormErrors({});
    setEditingTSC({ ...tsc });
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTscToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (tscToDelete) {
      setTSCs(prev => prev.filter(tsc => tsc.id !== tscToDelete));
      setDeleteConfirmOpen(false);
      setTscToDelete(null);
    }
  }, [tscToDelete]);

  const handleSave = useCallback(() => {
    if (editingTSC && validateForm(editingTSC)) {
      const maxId = Math.max(...tscs.map(tsc => parseInt(tsc.id)), 0);
      const updatedTSCs = editingTSC.id
        ? tscs.map(tsc => (tsc.id === editingTSC.id ? editingTSC : tsc))
        : [...tscs, { ...editingTSC, id: (maxId + 1).toString() }];
      setTSCs(updatedTSCs);
      setEditingTSC(null);
      setIsDialogOpen(false);
      setFormErrors({});
    }
  }, [editingTSC, tscs, validateForm]);

  const renderProficiencyTable = useCallback((proficiencies: TSCProficiency[]) => {
    return (
      <div className="space-y-8">
        <Table>
          <TableHeader>
            <TableRow>
              {PROFICIENCY_LEVELS.map(level => (
                <TableHead key={level} className="text-center">
                  Level {level}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              {PROFICIENCY_LEVELS.map(level => {
                const prof = proficiencies.find(p => p.level === level);
                return (
                  <TableCell key={level} className="align-top">
                    {prof && (
                      <div className="space-y-2">
                        <div className="font-medium">{prof.code}</div>
                        <div>{prof.description}</div>
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>

        <div>
          <h4 className="font-semibold mb-2">Knowledge</h4>
          <Table>
            <TableHeader>
              <TableRow>
                {PROFICIENCY_LEVELS.map(level => (
                  <TableHead key={level} className="text-center">
                    Level {level}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {PROFICIENCY_LEVELS.map(level => {
                  const prof = proficiencies.find(p => p.level === level);
                  return (
                    <TableCell key={level} className="align-top">
                      {prof?.knowledge && (
                        <ul className="list-disc pl-5 space-y-1">
                          {prof.knowledge.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Abilities</h4>
          <Table>
            <TableHeader>
              <TableRow>
                {PROFICIENCY_LEVELS.map(level => (
                  <TableHead key={level} className="text-center">
                    Level {level}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                {PROFICIENCY_LEVELS.map(level => {
                  const prof = proficiencies.find(p => p.level === level);
                  return (
                    <TableCell key={level} className="align-top">
                      {prof?.abilities && (
                        <ul className="list-disc pl-5 space-y-1">
                          {prof.abilities.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }, []);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          TSC Manager
          {selectedBusinessUnit !== 'ALL' && ` - ${BUSINESS_UNITS[selectedBusinessUnit]}`}
        </CardTitle>
        <Button onClick={handleCreate} disabled={selectedBusinessUnit === 'ALL'}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New TSC
        </Button>
      </CardHeader>
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
                        {renderProficiencyTable(tsc.proficiencies)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Range of Application</h3>
                        {tsc.rangeOfApplication.length > 0 ? (
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTSC?.id ? 'Edit TSC' : 'Create New TSC'}</DialogTitle>
            <DialogDescription>
              {editingTSC?.id
                ? 'Edit the TSC details below.'
                : 'Enter the details for the new TSC.'}
            </DialogDescription>
          </DialogHeader>
          {editingTSC && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editingTSC.title}
                  onChange={e => setEditingTSC({ ...editingTSC, title: e.target.value })}
                  className={formErrors.title ? 'border-red-500' : ''}
                />
                {formErrors.title && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>
                )}
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editingTSC.category}
                  onChange={e => setEditingTSC({ ...editingTSC, category: e.target.value })}
                  className={formErrors.category ? 'border-red-500' : ''}
                />
                {formErrors.category && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.category}</p>
                )}
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingTSC.description}
                  onChange={e => setEditingTSC({ ...editingTSC, description: e.target.value })}
                  className={formErrors.description ? 'border-red-500' : ''}
                />
                {formErrors.description && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
                )}
              </div>
              <div>
                <Label>Proficiencies</Label>
                {formErrors.proficiencies && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.proficiencies}</p>
                )}
                <div className="grid grid-cols-6 gap-4 mt-2">
                  {PROFICIENCY_LEVELS.map(level => {
                    const prof = editingTSC.proficiencies.find(p => p.level === level) || {
                      ...emptyProficiency,
                      level,
                    };
                    return (
                      <div key={level} className="space-y-4">
                        <div className="font-medium text-center">Level {level}</div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Code"
                            value={prof.code}
                            onChange={e => {
                              const newProficiencies = [...editingTSC.proficiencies];
                              const index = newProficiencies.findIndex(p => p.level === level);
                              if (index >= 0) {
                                newProficiencies[index] = {
                                  ...newProficiencies[index],
                                  code: e.target.value,
                                };
                              } else {
                                newProficiencies.push({
                                  ...emptyProficiency,
                                  level,
                                  code: e.target.value,
                                });
                              }
                              setEditingTSC({ ...editingTSC, proficiencies: newProficiencies });
                            }}
                            className={
                              formErrors[`proficiency_${level}_code`] ? 'border-red-500' : ''
                            }
                          />
                          {formErrors[`proficiency_${level}_code`] && (
                            <p className="text-sm text-red-500">
                              {formErrors[`proficiency_${level}_code`]}
                            </p>
                          )}
                          <Textarea
                            placeholder="Description"
                            value={prof.description}
                            onChange={e => {
                              const newProficiencies = [...editingTSC.proficiencies];
                              const index = newProficiencies.findIndex(p => p.level === level);
                              if (index >= 0) {
                                newProficiencies[index] = {
                                  ...newProficiencies[index],
                                  description: e.target.value,
                                };
                              } else {
                                newProficiencies.push({
                                  ...emptyProficiency,
                                  level,
                                  description: e.target.value,
                                });
                              }
                              setEditingTSC({ ...editingTSC, proficiencies: newProficiencies });
                            }}
                            className={
                              formErrors[`proficiency_${level}_description`] ? 'border-red-500' : ''
                            }
                          />
                          {formErrors[`proficiency_${level}_description`] && (
                            <p className="text-sm text-red-500">
                              {formErrors[`proficiency_${level}_description`]}
                            </p>
                          )}
                          <div>
                            <Label className="text-sm">Knowledge</Label>
                            {prof.knowledge?.map((item, index) => (
                              <div key={index} className="flex space-x-2 mb-2">
                                <Input
                                  value={item}
                                  onChange={e => {
                                    const newProficiencies = [...editingTSC.proficiencies];
                                    const profIndex = newProficiencies.findIndex(
                                      p => p.level === level,
                                    );
                                    if (profIndex >= 0) {
                                      const newKnowledge = [
                                        ...newProficiencies[profIndex].knowledge,
                                      ];
                                      newKnowledge[index] = e.target.value;
                                      newProficiencies[profIndex] = {
                                        ...newProficiencies[profIndex],
                                        knowledge: newKnowledge,
                                      };
                                    } else {
                                      const newKnowledge = [e.target.value];
                                      newProficiencies.push({
                                        ...emptyProficiency,
                                        level,
                                        knowledge: newKnowledge,
                                      });
                                    }
                                    setEditingTSC({
                                      ...editingTSC,
                                      proficiencies: newProficiencies,
                                    });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newProficiencies = [...editingTSC.proficiencies];
                                    const profIndex = newProficiencies.findIndex(
                                      p => p.level === level,
                                    );
                                    if (profIndex >= 0) {
                                      const newKnowledge = newProficiencies[
                                        profIndex
                                      ].knowledge.filter((_, i) => i !== index);
                                      newProficiencies[profIndex] = {
                                        ...newProficiencies[profIndex],
                                        knowledge: newKnowledge,
                                      };
                                      setEditingTSC({
                                        ...editingTSC,
                                        proficiencies: newProficiencies,
                                      });
                                    }
                                  }}
                                  aria-label="Remove knowledge item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newProficiencies = [...editingTSC.proficiencies];
                                const index = newProficiencies.findIndex(p => p.level === level);
                                if (index >= 0) {
                                  newProficiencies[index] = {
                                    ...newProficiencies[index],
                                    knowledge: [...(newProficiencies[index].knowledge || []), ''],
                                  };
                                } else {
                                  newProficiencies.push({
                                    ...emptyProficiency,
                                    level,
                                    knowledge: [''],
                                  });
                                }
                                setEditingTSC({ ...editingTSC, proficiencies: newProficiencies });
                              }}
                            >
                              Add Knowledge
                            </Button>
                          </div>
                          <div>
                            <Label className="text-sm">Abilities</Label>
                            {prof.abilities?.map((item, index) => (
                              <div key={index} className="flex space-x-2 mb-2">
                                <Input
                                  value={item}
                                  onChange={e => {
                                    const newProficiencies = [...editingTSC.proficiencies];
                                    const profIndex = newProficiencies.findIndex(
                                      p => p.level === level,
                                    );
                                    if (profIndex >= 0) {
                                      const newAbilities = [
                                        ...newProficiencies[profIndex].abilities,
                                      ];
                                      newAbilities[index] = e.target.value;
                                      newProficiencies[profIndex] = {
                                        ...newProficiencies[profIndex],
                                        abilities: newAbilities,
                                      };
                                    } else {
                                      const newAbilities = [e.target.value];
                                      newProficiencies.push({
                                        ...emptyProficiency,
                                        level,
                                        abilities: newAbilities,
                                      });
                                    }
                                    setEditingTSC({
                                      ...editingTSC,
                                      proficiencies: newProficiencies,
                                    });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newProficiencies = [...editingTSC.proficiencies];
                                    const profIndex = newProficiencies.findIndex(
                                      p => p.level === level,
                                    );
                                    if (profIndex >= 0) {
                                      const newAbilities = newProficiencies[
                                        profIndex
                                      ].abilities.filter((_, i) => i !== index);
                                      newProficiencies[profIndex] = {
                                        ...newProficiencies[profIndex],
                                        abilities: newAbilities,
                                      };
                                      setEditingTSC({
                                        ...editingTSC,
                                        proficiencies: newProficiencies,
                                      });
                                    }
                                  }}
                                  aria-label="Remove ability item"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newProficiencies = [...editingTSC.proficiencies];
                                const index = newProficiencies.findIndex(p => p.level === level);
                                if (index >= 0) {
                                  newProficiencies[index] = {
                                    ...newProficiencies[index],
                                    abilities: [...(newProficiencies[index].abilities || []), ''],
                                  };
                                } else {
                                  newProficiencies.push({
                                    ...emptyProficiency,
                                    level,
                                    abilities: [''],
                                  });
                                }
                                setEditingTSC({ ...editingTSC, proficiencies: newProficiencies });
                              }}
                            >
                              Add Ability
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <Label>Range of Application</Label>
                {editingTSC.rangeOfApplication.map((item, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <Input
                      value={item}
                      onChange={e => {
                        const newRange = [...editingTSC.rangeOfApplication];
                        newRange[index] = e.target.value;
                        setEditingTSC({ ...editingTSC, rangeOfApplication: newRange });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newRange = editingTSC.rangeOfApplication.filter(
                          (_, i) => i !== index,
                        );
                        setEditingTSC({ ...editingTSC, rangeOfApplication: newRange });
                      }}
                      aria-label="Remove range of application item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setEditingTSC({
                      ...editingTSC,
                      rangeOfApplication: [...editingTSC.rangeOfApplication, ''],
                    })
                  }
                >
                  Add Range of Application Item
                </Button>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save TSC
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete TSC</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this TSC? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
