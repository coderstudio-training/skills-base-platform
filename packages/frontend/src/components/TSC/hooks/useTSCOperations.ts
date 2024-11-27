import { TSC, emptyTSC } from '@/components/TSC/types';
import { getKeyFromValue } from '@/components/TSC/utils';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

export const useTSCOperations = (
  selectedBusinessUnit: string,
  initialTSCs: TSC[],
  setFormErrors: Dispatch<SetStateAction<{ [key: string]: string }>>,
  validateForm: (tsc: TSC) => boolean,
) => {
  const [tscs, setTSCs] = useState<TSC[]>(initialTSCs);
  const [editingTSC, setEditingTSC] = useState<TSC | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tscToDelete, setTscToDelete] = useState<string | null>(null);

  const handleCreate = useCallback(() => {
    setFormErrors({});
    setEditingTSC({ ...emptyTSC, id: '', businessUnit: getKeyFromValue(selectedBusinessUnit) });
    setIsDialogOpen(true);
  }, [selectedBusinessUnit]);

  const handleEdit = useCallback((tsc: TSC) => {
    setFormErrors({});
    setEditingTSC(tsc);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTscToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (tscToDelete !== null) {
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
  }, [editingTSC, tscs]);

  return {
    tscs,
    setTSCs,
    editingTSC,
    isDialogOpen,
    deleteConfirmOpen,
    handleCreate,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleSave,
    setEditingTSC,
    setIsDialogOpen,
    setDeleteConfirmOpen,
  };
};
