'use client';

import { PROFICIENCY_LEVELS } from '@/components/Dashboard/constants';
import { emptyProficiency, TSCFormProps } from '@/components/Dashboard/types';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Save, Trash2 } from 'lucide-react';

export default function TSCForm({
  isOpen,
  setIsOpen,
  targetTSC,
  setTargetTSC,
  formErrors,
  handleSave,
}: TSCFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{targetTSC?.id ? 'Edit TSC' : 'Create New TSC'}</DialogTitle>
          <DialogDescription>
            {targetTSC?.id ? 'Edit the TSC details below.' : 'Enter the details for the new TSC.'}
          </DialogDescription>
        </DialogHeader>
        {targetTSC && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={targetTSC.title}
                onChange={e => setTargetTSC({ ...targetTSC, title: e.target.value })}
                className={formErrors.title ? 'border-red-500' : ''}
              />
              {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={targetTSC.category}
                onChange={e => setTargetTSC({ ...targetTSC, category: e.target.value })}
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
                value={targetTSC.description}
                onChange={e => setTargetTSC({ ...targetTSC, description: e.target.value })}
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
                  const prof = targetTSC.proficiencies.find(p => p.level === level) || {
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
                            const newProficiencies = [...targetTSC.proficiencies];
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
                            setTargetTSC({ ...targetTSC, proficiencies: newProficiencies });
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
                            const newProficiencies = [...targetTSC.proficiencies];
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
                            setTargetTSC({ ...targetTSC, proficiencies: newProficiencies });
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
                                  const newProficiencies = [...targetTSC.proficiencies];
                                  const profIndex = newProficiencies.findIndex(
                                    p => p.level === level,
                                  );
                                  if (profIndex >= 0) {
                                    const newKnowledge = [...newProficiencies[profIndex].knowledge];
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
                                  setTargetTSC({
                                    ...targetTSC,
                                    proficiencies: newProficiencies,
                                  });
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newProficiencies = [...targetTSC.proficiencies];
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
                                    setTargetTSC({
                                      ...targetTSC,
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
                              const newProficiencies = [...targetTSC.proficiencies];
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
                              setTargetTSC({ ...targetTSC, proficiencies: newProficiencies });
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
                                  const newProficiencies = [...targetTSC.proficiencies];
                                  const profIndex = newProficiencies.findIndex(
                                    p => p.level === level,
                                  );
                                  if (profIndex >= 0) {
                                    const newAbilities = [...newProficiencies[profIndex].abilities];
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
                                  setTargetTSC({
                                    ...targetTSC,
                                    proficiencies: newProficiencies,
                                  });
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newProficiencies = [...targetTSC.proficiencies];
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
                                    setTargetTSC({
                                      ...targetTSC,
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
                              const newProficiencies = [...targetTSC.proficiencies];
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
                              setTargetTSC({ ...targetTSC, proficiencies: newProficiencies });
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
              {targetTSC.rangeOfApplication.map((item, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <Input
                    value={item}
                    onChange={e => {
                      const newRange = [...targetTSC.rangeOfApplication];
                      newRange[index] = e.target.value;
                      setTargetTSC({ ...targetTSC, rangeOfApplication: newRange });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newRange = targetTSC.rangeOfApplication.filter((_, i) => i !== index);
                      setTargetTSC({ ...targetTSC, rangeOfApplication: newRange });
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
                  setTargetTSC({
                    ...targetTSC,
                    rangeOfApplication: [...targetTSC.rangeOfApplication, ''],
                  })
                }
              >
                Add Range of Application Item
              </Button>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
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
  );
}
