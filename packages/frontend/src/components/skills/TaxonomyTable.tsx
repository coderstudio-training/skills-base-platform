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
import { IBaseTaxonomy, ITechnicalTaxonomy } from '@/lib/skills/types';
import { useState } from 'react';

export default function TaxonomyTable({ data }: ITechnicalTaxonomy) {
  const [tableData, setTableData] = useState(data); // Local state to manage table edits

  const handleEdit = (docId: string, field: keyof IBaseTaxonomy, value: string) => {
    setTableData(prevData =>
      prevData.map(row => (row.docId === docId ? { ...row, [field]: value } : row)),
    );
  };

  const saveChanges = () => {
    console.log('Updated Data:', tableData); // Replace with your callback or data-saving logic
    alert('Changes saved successfully!');
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
            <TableHead className="text-left">Proficiency Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map(row => (
            <TableRow key={row.docId}>
              <TableCell>{row.category}</TableCell>
              <TableCell
                contentEditable
                suppressContentEditableWarning
                onBlur={e => handleEdit(row.docId, 'title', e.currentTarget.textContent || '')}
                className="border border-gray-300 p-2"
              >
                {row.title}
              </TableCell>
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
              <TableCell
                contentEditable
                suppressContentEditableWarning
                onBlur={e =>
                  handleEdit(row.docId, 'proficiencyDescription', e.currentTarget.textContent || '')
                }
                className="border border-gray-300 p-2"
              >
                {JSON.stringify(row.proficiencyDescription, null, 2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
