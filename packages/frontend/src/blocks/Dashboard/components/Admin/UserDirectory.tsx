import BaseCard from '@/blocks/Dashboard/components/Cards/BaseCard';
import { SkillsDialog } from '@/blocks/Dashboard/components/Dialogs/SkillsDialog';
import { useEmployeeSkills } from '@/blocks/Dashboard/hooks/useEmployeeSkills';
import { UserDirectoryProps } from '@/blocks/Dashboard/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState } from 'react';

export function UserDirectory({
  employees,
  loading,
  totalItems,
  totalPages,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: UserDirectoryProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<{ email: string; name: string } | null>(
    null,
  );
  const [goToPage, setGoToPage] = useState<string>('');
  const { skills, loading: skillsLoading, fetchSkills, clearSkills } = useEmployeeSkills();

  const handleViewSkills = async (email: string, name: string) => {
    setSelectedEmployee({ email, name });
    await fetchSkills(email);
  };

  const handleCloseDialog = () => {
    setSelectedEmployee(null);
    clearSkills();
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(goToPage);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        onPageChange(pageNumber);
        setGoToPage('');
      } else {
        alert(`Please enter a valid page number between 1 and ${totalPages}`);
      }
    }
  };

  return (
    <BaseCard
      title="User Directory"
      description="View and manage users and their skills"
      loading={loading}
      loadingMessage="Loading employees..."
      height="auto"
    >
      <div className="space-y-4">
        <div className="space-y-4">
          {employees.map(employee => (
            <div
              key={employee.employeeId}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  {employee.picture ? (
                    <AvatarImage
                      src={employee.picture}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      onError={e => {
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <AvatarFallback className="uppercase bg-gray-100 text-gray-600">
                    {employee.firstName?.[0]}
                    {employee.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{`${employee.firstName} ${employee.lastName}`}</p>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{employee.grade}</Badge>
                <Badge variant="secondary">{employee.businessUnit}</Badge>
                <Badge variant={employee.employmentStatus === 'Active' ? 'success' : 'destructive'}>
                  {employee.employmentStatus}
                </Badge>
                <SkillsDialog
                  selectedEmployee={selectedEmployee}
                  skills={skills}
                  loading={skillsLoading}
                  onOpenChange={open => !open && handleCloseDialog()}
                  onViewSkills={handleViewSkills}
                  EmployeeDetails={{
                    email: employee.email,
                    firstName: employee.firstName,
                    lastName: employee.lastName,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={limit === totalItems ? 'all' : limit.toString()}
              onValueChange={onLimitChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="all">Show all</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">
              Showing {Math.min((page - 1) * limit + 1, totalItems)} -{' '}
              {Math.min(page * limit, totalItems)} of {totalItems} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page === 1 || loading || limit === totalItems}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1 || loading || limit === totalItems}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm">Page</span>
              <Input
                type="number"
                value={goToPage}
                onChange={e => setGoToPage(e.target.value)}
                onKeyDown={handleGoToPage}
                className="w-16 h-8 text-sm"
                min={1}
                max={totalPages}
                placeholder={page.toString()}
                disabled={limit === totalItems}
              />
              <span className="text-sm">of {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages || loading || limit === totalItems}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page === totalPages || loading || limit === totalItems}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}
