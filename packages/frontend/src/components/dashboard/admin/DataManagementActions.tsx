'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Download, Loader2, Upload, X } from 'lucide-react';
import { useState } from 'react';

// interface DataSource {
//   name: string;
//   status: 'idle' | 'syncing' | 'success' | 'error';
// }

export default function DataManagementActions() {
  const [syncStatus, setSyncStatus] = useState<
    Record<string, 'idle' | 'syncing' | 'success' | 'error'>
  >({
    'Self-Assessment': 'idle',
    'Manager Assessment': 'idle',
    'Staff List': 'idle',
    Courses: 'idle',
    'Learning Paths': 'idle',
    'Skills Matrix': 'idle',
    'Skills Taxonomy': 'idle',
  });

  const handleSync = async (dataSource: string) => {
    setSyncStatus(prev => ({ ...prev, [dataSource]: 'syncing' }));
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSyncStatus(prev => ({ ...prev, [dataSource]: 'success' }));
  };

  const handleExportReport = async () => {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Report exported successfully!');
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-2">
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Import Data
        </Button>
        <Button onClick={handleExportReport}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Sync Data
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select Data Source</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(syncStatus).map(([source, status]) => (
              <DropdownMenuItem key={source} onSelect={() => handleSync(source)}>
                <span className="flex-1">{source}</span>
                {status === 'idle' && <span className="text-muted-foreground">(Not synced)</span>}
                {status === 'syncing' && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === 'success' && <Check className="h-4 w-4 text-green-500" />}
                {status === 'error' && <X className="h-4 w-4 text-red-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
