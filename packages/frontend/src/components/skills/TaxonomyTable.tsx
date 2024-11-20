'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogExit,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bulkUpsert } from '@/lib/skills/api';
import { IBaseTaxonomy, IBulkUpsertDTO, ITaxonomyDTO } from '@/lib/skills/types';
import { useState } from 'react';

export default function TaxonomyTable({ data }: IBulkUpsertDTO) {
  const [tableData, setTableData] = useState(data); // Local state to manage table edits
  const [selectedRow, setSelectedRow] = useState<ITaxonomyDTO | null>(null); // State for selected row (for dialog)
  const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility

  const handleEdit = (docId: string, field: keyof IBaseTaxonomy, value: string) => {
    setTableData(prevData =>
      prevData.map(row => (row.docId === docId ? { ...row, [field]: value } : row)),
    );
  };

  const handleRowClick = (row: ITaxonomyDTO) => {
    setSelectedRow(row); // Set the selected row for the dialog
  };

  const validateData = (data: ITaxonomyDTO[]) => {
    return data.every(
      item =>
        item.docId &&
        item.docRevisionId &&
        item.docTitle &&
        item.title &&
        item.category &&
        item.description &&
        typeof item.proficiencyDescription === 'object' &&
        typeof item.abilities === 'object' &&
        typeof item.knowledge === 'object' &&
        item.businessUnit,
    );
  };

  const handleDialogClose = () => {
    if (selectedRow) {
      // Update tableData with changes from selectedRow
      setTableData(prevData =>
        prevData.map(row => (row.docId === selectedRow.docId ? { ...selectedRow } : row)),
      );
    }
    setDialogOpen(false); // Close the dialog
    setSelectedRow(null); // Reset the selected row when the dialog is closed
  };

  const saveChanges = async () => {
    console.log('Updated Data:', { data: tableData });

    if (!validateData(tableData)) {
      alert('Validation failed: Ensure all required fields are filled correctly.');
      return;
    }

    try {
      const payload: IBulkUpsertDTO = { data: tableData };

      // Send the payload to the backend
      const response = await bulkUpsert(payload);

      console.log('Response:', response);

      if (response.error) {
        alert(`${response.error.status} | ${response.error.message}`);
      } else {
        alert(`Successfully updated ${response.data?.updatedCount} records.`);
      }
    } catch (err) {
      console.error('Save changes failed:', err);
      alert('An unexpected error occurred while saving changes.');
    }
  };

  // Get dynamic column names (from proficiencyDescription or knowledge or abilities)
  const getDynamicColumns = (key: keyof ITaxonomyDTO) => {
    return Object.keys(selectedRow?.[key] || {}).map(level => level);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Input
          type="text"
          placeholder="Filter by category..."
          className="w-1/2"
          onChange={e => {
            const query = e.target.value.toLowerCase();
            setTableData(
              data.filter(
                row =>
                  row.category.toLowerCase().includes(query) ||
                  row.title.toLowerCase().includes(query),
              ),
            );
          }}
        />
        <Button onClick={saveChanges} className="ml-4">
          Save Changes
        </Button>
      </div>

      <Table className="border border-gray-200">
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Category</TableHead>
            <TableHead className="text-left">Title</TableHead>
            <TableHead className="text-left">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map(row => (
            <TableRow
              key={row.docId}
              onClick={() => handleRowClick(row)}
              className={selectedRow?.docId === row.docId ? 'bg-gray-200' : ''} // Highlight selected row
            >
              <TableCell>{row.category}</TableCell>
              <TableCell>{row.title}</TableCell>
              <TableCell
                contentEditable
                suppressContentEditableWarning
                onBlur={e =>
                  handleEdit(row.docId, 'description', e.currentTarget.textContent || '')
                }
                className="border border-gray-300 p-2"
              >
                {row.description}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Dialog for Expanded Row */}
      <Dialog>
        <DialogTrigger>
          <Button disabled={!selectedRow} className="m-5">
            Open Details
          </Button>
        </DialogTrigger>
        <div
          className={`${
            dialogOpen ? 'block' : 'hidden'
          } fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center`}
        ></div>
        <DialogContent>
          {selectedRow && (
            <>
              <DialogHeader>
                <DialogTitle>Expanded Information for {selectedRow.title}</DialogTitle>
              </DialogHeader>

              <Table className="border border-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Type</TableHead>
                    {getDynamicColumns('proficiencyDescription').map(level => (
                      <TableHead key={level} className="text-left">
                        {level}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {['proficiencyDescription', 'knowledge', 'abilities'].map(key => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      {getDynamicColumns(key as keyof ITaxonomyDTO).map(level => {
                        const rowData = selectedRow?.[key as keyof ITaxonomyDTO]; // Safe access

                        // Check if rowData is an object and has the key 'level'
                        if (rowData && typeof rowData === 'object' && !Array.isArray(rowData)) {
                          const typedRowData = rowData as Record<string, string[]>;

                          // If it's an object (e.g., { "Level 1": ["item1", "item2"] })
                          return (
                            <TableCell
                              key={level}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={e => {
                                const updatedValue = e.currentTarget.textContent || '';
                                const updatedArray = updatedValue
                                  .split(',')
                                  .map(item => item.trim());

                                setSelectedRow(prev => {
                                  if (!prev) return null;

                                  const currentValue = prev[key as keyof ITaxonomyDTO];

                                  // Check if the current value is an object
                                  if (
                                    typeof currentValue === 'object' &&
                                    !Array.isArray(currentValue)
                                  ) {
                                    return {
                                      ...prev,
                                      [key]: {
                                        ...currentValue, // Safely spread the current object
                                        [level]: updatedArray,
                                      },
                                    };
                                  }

                                  // Handle cases where the current value is not an object
                                  return {
                                    ...prev,
                                    [key]: updatedArray,
                                  };
                                });
                              }}
                              className="border border-gray-300 p-2"
                            >
                              <ul>
                                {(typedRowData[level] || []).map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </TableCell>
                          );
                        }

                        if (Array.isArray(rowData)) {
                          // If it's an array (e.g., ["item1", "item2"])
                          return (
                            <TableCell
                              key={level}
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={e => {
                                const updatedValue = e.currentTarget.textContent || '';
                                const updatedArray = updatedValue
                                  .split(',')
                                  .map(item => item.trim());

                                setSelectedRow(prev =>
                                  prev
                                    ? {
                                        ...prev,
                                        [key]: updatedArray,
                                      }
                                    : null,
                                );
                              }}
                              className="border border-gray-300 p-2"
                            >
                              <ul>
                                {rowData.map((item, idx) => (
                                  <li key={idx}>{item}</li>
                                ))}
                              </ul>
                            </TableCell>
                          );
                        }

                        return <TableCell key={level}>N/A</TableCell>; // Fallback if it's neither object nor array
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Close Button for Dialog */}
              <DialogExit>
                <Button onClick={handleDialogClose} className="mt-4">
                  Close
                </Button>
              </DialogExit>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
