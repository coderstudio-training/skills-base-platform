'use client';

import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import { BusinessUnit } from '../types';

interface TSCManagerHeaderProps {
  buCode: BusinessUnit;
  selectedBusinessUnit: string;
  handleCreate: () => void;
}

export default function TSCManagerHeader({
  buCode,
  selectedBusinessUnit,
  handleCreate,
}: TSCManagerHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>
        TSC Manager
        {buCode !== 'ALL' && ` - ${selectedBusinessUnit}`}
      </CardTitle>
      <Button onClick={handleCreate} disabled={buCode === 'ALL'}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New TSC
      </Button>
    </CardHeader>
  );
}
