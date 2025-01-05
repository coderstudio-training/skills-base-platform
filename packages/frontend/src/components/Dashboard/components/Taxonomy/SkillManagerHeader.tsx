'use client';

import { BusinessUnit } from '@/components/Dashboard/types';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

interface TSCManagerHeaderProps {
  buCode: BusinessUnit;
  selectedBusinessUnit: string;
  handleCreate: () => void;
}

export default function SKillManagerHeader({
  buCode,
  selectedBusinessUnit,
  handleCreate,
}: TSCManagerHeaderProps) {
  return (
    <CardHeader id={'tsc-header'} className="flex flex-row items-center justify-between">
      <CardTitle>
        Skills Manager
        {buCode !== 'ALL' && ` - ${selectedBusinessUnit}`}
      </CardTitle>
      <Button
        className="bg-violet-300 hover:bg-violet-500 dark:bg-violet-700 dark:hover:bg-violet-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        onClick={handleCreate}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Skill
      </Button>
    </CardHeader>
  );
}
