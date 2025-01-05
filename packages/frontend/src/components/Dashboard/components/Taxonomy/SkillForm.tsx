'use client';

import { PROFICIENCY_LEVELS } from '@/components/Dashboard/constants';
import { emptyProficiency, emptySSCProficiency, TSCFormProps } from '@/components/Dashboard/types';
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
import { isSoftSkill, isTSC } from '@/lib/utils/taxonomy-utils';
import { Save, Trash2 } from 'lucide-react';

export default function SkillForm({
  isOpen,
  setIsOpen,
  targetSkill,
  setTargetSkill,
  formErrors,
  handleSave,
}: TSCFormProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400">
        <DialogHeader className="bg-background border-b pb-2">
          <DialogTitle>{targetSkill?.id ? 'Edit Skill' : 'Create New Skill'}</DialogTitle>
          <DialogDescription>
            {targetSkill?.id
              ? 'Edit the Skill details below.'
              : 'Enter the details for the new Skill.'}
          </DialogDescription>
        </DialogHeader>
        {targetSkill && (
          <div className="space-y-6 p-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={targetSkill.title}
                onChange={e => setTargetSkill({ ...targetSkill, title: e.target.value })}
                className={formErrors.title ? 'border-red-500' : ''}
              />
              {formErrors.title && <p className="text-sm text-red-500 mt-1">{formErrors.title}</p>}
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={targetSkill.category}
                onChange={e => setTargetSkill({ ...targetSkill, category: e.target.value })}
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
                value={targetSkill.description}
                onChange={e => setTargetSkill({ ...targetSkill, description: e.target.value })}
                className={formErrors.description ? 'border-red-500' : ''}
              />
              {formErrors.description && (
                <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>
              )}
            </div>
            {isSoftSkill(targetSkill) && (
              <div>
                <Label>Proficiencies</Label>
                {formErrors.proficiencies && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.proficiencies}</p>
                )}
                <div className="grid grid-cols-6 gap-4 mt-2">
                  {targetSkill.proficiencies.map((prof, level) => {
                    return (
                      <div key={level} className="space-y-4">
                        <div className="font-medium text-center">Level {level + 1}</div>
                        <div className="flex flex-col justify-between space-y-2">
                          <Label className="text-sm">Proficiency Description</Label>
                          {prof.description.map((item, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                              <Input
                                value={item}
                                onChange={e => {
                                  const newProficiencies = [...targetSkill.proficiencies];
                                  if (level >= 0) {
                                    const newDescription = [...newProficiencies[level].description];
                                    newDescription[index] = e.target.value;
                                    newProficiencies[level] = {
                                      ...newProficiencies[level],
                                      description: newDescription,
                                    };
                                  } else {
                                    const newDescriptioon = [e.target.value];
                                    newProficiencies.push({
                                      ...emptySSCProficiency,
                                      description: newDescriptioon,
                                    });
                                  }
                                  setTargetSkill({
                                    ...targetSkill,
                                    proficiencies: newProficiencies,
                                  });
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="hover:text-red-500"
                                onClick={() => {
                                  const newProficiencies = [...targetSkill.proficiencies];
                                  if (level >= 0) {
                                    const newDescription = newProficiencies[
                                      level
                                    ].description.filter((_, i) => i !== index);
                                    newProficiencies[level] = {
                                      ...newProficiencies[level],
                                      description: newDescription,
                                    };
                                    setTargetSkill({
                                      ...targetSkill,
                                      proficiencies: newProficiencies,
                                    });
                                  }
                                }}
                                aria-label="Remove proficiency description item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="hover:font-bold hover:text-blue-400"
                            onClick={() => {
                              const newProficiencies = [...targetSkill.proficiencies];
                              if (level >= 0) {
                                newProficiencies[level] = {
                                  ...newProficiencies[level],
                                  description: [...(newProficiencies[level].description || []), ''],
                                };
                              } else {
                                newProficiencies.push({
                                  ...emptySSCProficiency,
                                  description: [''],
                                });
                              }
                              setTargetSkill({ ...targetSkill, proficiencies: newProficiencies });
                            }}
                          >
                            Add Proficiency
                          </Button>
                        </div>
                        <div className="flex flex-col justify-between space-y-2">
                          <Label className="text-sm">Benchmark</Label>
                          {prof.benchmark.map((item, index) => (
                            <div key={index} className="flex space-x-2 mb-2">
                              <Input
                                value={item}
                                onChange={e => {
                                  const newProficiencies = [...targetSkill.proficiencies];
                                  if (level >= 0) {
                                    const newBenchmark = [...newProficiencies[level].benchmark];
                                    newBenchmark[index] = e.target.value;
                                    newProficiencies[level] = {
                                      ...newProficiencies[level],
                                      benchmark: newBenchmark,
                                    };
                                  } else {
                                    const newBenchmark = [e.target.value];
                                    newProficiencies.push({
                                      ...emptySSCProficiency,
                                      benchmark: newBenchmark,
                                    });
                                  }
                                  setTargetSkill({
                                    ...targetSkill,
                                    proficiencies: newProficiencies,
                                  });
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="hover:text-red-500"
                                onClick={() => {
                                  const newProficiencies = [...targetSkill.proficiencies];
                                  if (level >= 0) {
                                    const newBenchmark = newProficiencies[level].benchmark.filter(
                                      (_, i) => i !== index,
                                    );
                                    newProficiencies[level] = {
                                      ...newProficiencies[level],
                                      benchmark: newBenchmark,
                                    };
                                    setTargetSkill({
                                      ...targetSkill,
                                      proficiencies: newProficiencies,
                                    });
                                  }
                                }}
                                aria-label="Remove benchmark item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="hover:font-bold hover:text-blue-400"
                            onClick={() => {
                              const newProficiencies = [...targetSkill.proficiencies];
                              if (level >= 0) {
                                newProficiencies[level] = {
                                  ...newProficiencies[level],
                                  benchmark: [...(newProficiencies[level].benchmark || []), ''],
                                };
                              } else {
                                newProficiencies.push({
                                  ...emptySSCProficiency,
                                  benchmark: [''],
                                });
                              }
                              setTargetSkill({ ...targetSkill, proficiencies: newProficiencies });
                            }}
                          >
                            Add Benchmark
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-col justify-between space-y-2">
                  <Label className="mt-3">Rating</Label>
                  {targetSkill.rating.map((item, index) => (
                    <div key={index} className="flex w-1/5 space-x-2 mb-2">
                      <Input
                        value={item}
                        onChange={e => {
                          const newRating = [...targetSkill.rating];
                          newRating[index] = e.target.value;
                          setTargetSkill({ ...targetSkill, rating: newRating });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="hover:text-red-500 "
                        size="sm"
                        onClick={() => {
                          const newRating = targetSkill.rating.filter((_, i) => i !== index);
                          setTargetSkill({ ...targetSkill, rating: newRating });
                        }}
                        aria-label="Remove rating item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    className="max-w-fit hover:text-blue-400 hover:font-bold"
                    size="sm"
                    onClick={() =>
                      setTargetSkill({
                        ...targetSkill,
                        rating: [...targetSkill.rating, ''],
                      })
                    }
                  >
                    Add Rating Item
                  </Button>
                </div>
              </div>
            )}
            {isTSC(targetSkill) && (
              <div>
                <Label>Proficiencies</Label>
                {formErrors.proficiencies && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.proficiencies}</p>
                )}
                <div className="grid grid-cols-6 gap-4 mt-2">
                  {PROFICIENCY_LEVELS.map(level => {
                    const prof = targetSkill.proficiencies.find(p => p.level === level) || {
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
                              const newProficiencies = [...targetSkill.proficiencies];
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
                              setTargetSkill({ ...targetSkill, proficiencies: newProficiencies });
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
                              const newProficiencies = [...targetSkill.proficiencies];
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
                              setTargetSkill({ ...targetSkill, proficiencies: newProficiencies });
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
                          <div className="flex flex-col justify-between space-y-2">
                            <Label className="text-sm">Knowledge</Label>
                            {prof.knowledge?.map((item, index) => (
                              <div key={index} className="flex space-x-2 mb-2">
                                <Input
                                  value={item}
                                  onChange={e => {
                                    const newProficiencies = [...targetSkill.proficiencies];
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
                                    setTargetSkill({
                                      ...targetSkill,
                                      proficiencies: newProficiencies,
                                    });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="hover:text-red-500"
                                  onClick={() => {
                                    const newProficiencies = [...targetSkill.proficiencies];
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
                                      setTargetSkill({
                                        ...targetSkill,
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
                              className="hover:font-bold hover:text-blue-400"
                              onClick={() => {
                                const newProficiencies = [...targetSkill.proficiencies];
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
                                setTargetSkill({ ...targetSkill, proficiencies: newProficiencies });
                              }}
                            >
                              Add Knowledge
                            </Button>
                          </div>
                          <div className="flex flex-col justify-between space-y-2">
                            <Label className="text-sm">Abilities</Label>
                            {prof.abilities?.map((item, index) => (
                              <div key={index} className="flex space-x-2 mb-2">
                                <Input
                                  value={item}
                                  onChange={e => {
                                    const newProficiencies = [...targetSkill.proficiencies];
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
                                    setTargetSkill({
                                      ...targetSkill,
                                      proficiencies: newProficiencies,
                                    });
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="hover:text-red-500"
                                  size="sm"
                                  onClick={() => {
                                    const newProficiencies = [...targetSkill.proficiencies];
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
                                      setTargetSkill({
                                        ...targetSkill,
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
                              className="hover:font-bold hover:text-blue-400"
                              onClick={() => {
                                const newProficiencies = [...targetSkill.proficiencies];
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
                                setTargetSkill({ ...targetSkill, proficiencies: newProficiencies });
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
                <div className="flex flex-col justify-between space-y-2">
                  <Label className="mt-3">Range of Application</Label>
                  {targetSkill.rangeOfApplication.map((item, index) => (
                    <div key={index} className="flex w-1/5 space-x-2 mb-2">
                      <Input
                        value={item}
                        onChange={e => {
                          const newRange = [...targetSkill.rangeOfApplication];
                          newRange[index] = e.target.value;
                          setTargetSkill({ ...targetSkill, rangeOfApplication: newRange });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="hover:text-red-500 "
                        size="sm"
                        onClick={() => {
                          const newRange = targetSkill.rangeOfApplication.filter(
                            (_, i) => i !== index,
                          );
                          setTargetSkill({ ...targetSkill, rangeOfApplication: newRange });
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
                    className="max-w-fit hover:text-blue-400 hover:font-bold"
                    size="sm"
                    onClick={() =>
                      setTargetSkill({
                        ...targetSkill,
                        rangeOfApplication: [...targetSkill.rangeOfApplication, ''],
                      })
                    }
                  >
                    Add Range of Application Item
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="hover:text-red-500 "
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600">
                <Save className="mr-2 h-4 w-4" />
                Save Skill
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
