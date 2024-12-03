'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Filter, Search } from 'lucide-react';

interface SearchAndFilterProps {
  selectedBusinessUnit: string;
  businessUnits: string[];
  searchQuery: string;
  onBusinessUnitChange: (unit: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading?: boolean;
}

export function SearchAndFilter({
  selectedBusinessUnit,
  businessUnits,
  searchQuery,
  onBusinessUnitChange,
  onSearchChange,
  isLoading = false,
}: SearchAndFilterProps) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 flex gap-2">
        <Select
          value={selectedBusinessUnit}
          onValueChange={onBusinessUnitChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                {selectedBusinessUnit}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {businessUnits.map(unit => (
              <SelectItem key={unit} value={unit}>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  {unit}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by users or skills..."
            className="pl-8 w-[300px]"
            value={searchQuery}
            onChange={onSearchChange}
            disabled={isLoading}
          />
        </div>
      </div>
      <Button variant="outline" size="icon" disabled={isLoading}>
        <Filter className="h-4 w-4" />
      </Button>
    </div>
  );
}
