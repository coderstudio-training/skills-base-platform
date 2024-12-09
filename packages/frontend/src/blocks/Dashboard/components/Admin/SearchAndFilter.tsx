import { SearchAndFilterProps } from '@/blocks/Dashboard/types';
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

const ALL_BUSINESS_UNITS = 'All Business Units';

export function SearchAndFilter({
  selectedBusinessUnit,
  businessUnits,
  searchQuery,
  onBusinessUnitChange,
  onSearchChange,
  isLoading = false,
}: SearchAndFilterProps) {
  const allUnits = [
    'All Business Units',
    ...businessUnits.filter(unit => unit !== ALL_BUSINESS_UNITS),
  ];

  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-1 flex gap-2">
        <Select
          value={selectedBusinessUnit}
          onValueChange={onBusinessUnitChange}
          disabled={isLoading}
        >
          <SelectTrigger className="min-w-[200px] w-fit">
            <SelectValue>
              <div className="flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                {selectedBusinessUnit}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allUnits.map(unit => (
              <SelectItem key={unit} value={unit}>
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  {unit}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            className="pl-8"
            value={searchQuery}
            onChange={onSearchChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={isLoading}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
