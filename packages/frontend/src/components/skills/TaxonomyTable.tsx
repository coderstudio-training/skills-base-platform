'use client';

import { Button } from '@/components/ui/button';
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

  const handleEdit = (docId: string, field: keyof IBaseTaxonomy, value: string) => {
    setTableData(prevData =>
      prevData.map(row => (row.docId === docId ? { ...row, [field]: value } : row)),
    );
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

  const saveChanges = async () => {
    console.log('Updated Data:', { data: tableData });

    if (!validateData(tableData)) {
      alert('Validation failed: Ensure all required fields are filled correctly.');
      return;
    }

    try {
      // Ensure the payload matches IBulkUpsertDTO
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
            <TableRow key={row.docId}>
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
    </div>
  );
}
