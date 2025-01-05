import { Taxonomy } from '@/components/Dashboard/types';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

export const useTSCOperations = (
  selectedBusinessUnit: string,
  initialTSCs: Taxonomy[],
  setFormErrors: Dispatch<SetStateAction<{ [key: string]: string }>>,
  validateForm: (taxonomy: Taxonomy) => boolean,
) => {
  const [tscs, setTSCs] = useState<Taxonomy[]>(initialTSCs);
  const [editingSkill, setEditingSkill] = useState<Taxonomy | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setFormErrors({});
    setEditingSkill(editingSkill);
    setIsDialogOpen(true);
  }, [selectedBusinessUnit]);

  const handleEdit = useCallback((taxonomy: Taxonomy) => {
    setFormErrors({});
    setEditingSkill(taxonomy);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSkillToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (skillToDelete !== null) {
      setTSCs(prev => prev.filter(tsc => tsc.id !== skillToDelete));
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
    }
  }, [skillToDelete]);

  const handleSave = useCallback(() => {
    if (editingSkill && validateForm(editingSkill)) {
      const maxId = Math.max(...tscs.map(tsc => parseInt(tsc.id)), 0);
      const updatedTSCs = editingSkill.id
        ? tscs.map(tsc => (tsc.id === editingSkill.id ? editingSkill : tsc))
        : [...tscs, { ...editingSkill, id: (maxId + 1).toString() }];
      setTSCs(updatedTSCs);
      setEditingSkill(null);
      setIsDialogOpen(false);
      setFormErrors({});
    }
  }, [editingSkill, tscs]);

  return {
    tscs,
    setTSCs,
    editingSkill,
    isDialogOpen,
    deleteConfirmOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleSave,
    setEditingSkill,
    setIsDialogOpen,
    setDeleteConfirmOpen,
  };
};
