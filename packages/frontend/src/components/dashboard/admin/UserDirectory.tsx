import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employee, SkillDetail } from '@/types/admin';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface EmployeeDirectoryProps {
  employees: Employee[];
  loading: boolean;
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: string) => void;
}

export default function EmployeeDirectory({
  employees,
  loading,
  totalItems,
  totalPages,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: EmployeeDirectoryProps) {
  const [selectedEmployeeSkills, setSelectedEmployeeSkills] = useState<SkillDetail[]>([]);
  const [goToPage, setGoToPage] = useState<string>('');

  const fetchEmployeeSkills = async (email: string) => {
    try {
      const response = await fetch(`/api/skills/employee/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee skills');
      }
      const data = await response.json();

      // Fetch descriptions for each skill using taxonomy find by title
      const skillsWithDescriptions = await Promise.all(
        data.skills.map(async (skill: SkillDetail) => {
          try {
            const taxonomyResponse = await fetch(
              `/api/taxonomy/title/${skill.skill}?businessUnit=QA`,
            );

            if (!taxonomyResponse.ok) {
              console.warn(`No taxonomy found for skill: ${skill.skill}`);
              return {
                ...skill,
                description: 'No description available',
                proficiencyDescription: 'No proficiency description available',
              };
            }

            const taxonomyData = await taxonomyResponse.json();

            // Use Math.floor to get the exact level key
            const levelKey = `Level ${Math.floor(skill.average)}`;
            const proficiencyDescription =
              taxonomyData[0]?.proficiencyDescription?.[levelKey]?.[1] ||
              'No proficiency description available';

            return {
              ...skill,
              description:
                taxonomyData.length > 0 ? taxonomyData[0].description : 'No description available',
              proficiencyDescription,
            };
          } catch (error) {
            console.error(`Error fetching description for ${skill.skill}:`, error);
            return {
              ...skill,
              description: 'No description available',
              proficiencyDescription: 'No proficiency description available',
            };
          }
        }),
      );

      setSelectedEmployeeSkills(skillsWithDescriptions);
    } catch (error) {
      console.error('Error fetching employee skills:', error);
      setSelectedEmployeeSkills([]);
    }
  };

  const getSkillLevelLabel = (average: number) => {
    if (average <= 1) return 'Novice';
    if (average <= 2) return 'Beginner';
    if (average <= 3) return 'Intermediate';
    if (average <= 4) return 'Advanced';
    if (average <= 5) return 'Expert';
    return 'Guru';
  };

  const getSkillStatusIcon = (currentLevel: number, requiredLevel: number) => {
    if (currentLevel >= requiredLevel) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    } else if (currentLevel === requiredLevel - 1) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>View and manage users and their skills</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading employees...</p>
            </div>
          ) : (
            employees.map(employee => (
              <div
                key={employee.employeeId}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {`${employee.firstName[0]}${employee.lastName[0]}`}
                  </div>
                  <div>
                    <p className="font-medium">{`${employee.firstName} ${employee.lastName}`}</p>
                    <p className="text-sm text-gray-500">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{employee.grade}</Badge>
                  <Badge variant="secondary">{employee.businessUnit}</Badge>
                  <Badge
                    variant={employee.employmentStatus === 'Active' ? 'success' : 'destructive'}
                  >
                    {employee.employmentStatus}
                  </Badge>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fetchEmployeeSkills(employee.email)}
                      >
                        View Skills
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{`${employee.firstName} ${employee.lastName}'s Skills`}</DialogTitle>
                        <DialogDescription>Skill levels and proficiencies</DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="h-[500px] w-full pr-4">
                        <div className="space-y-4">
                          {selectedEmployeeSkills.length > 0 ? (
                            selectedEmployeeSkills.map(skill => (
                              <div key={skill.skill} className="space-y-2 border-b pb-4">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{skill.skill}</span>
                                  <div className="flex items-center space-x-2">
                                    <Progress
                                      value={(skill.average / skill.requiredRating) * 100}
                                      className="w-[100px]"
                                    />
                                    <span className="text-sm text-gray-500">
                                      {getSkillLevelLabel(skill.average)}
                                    </span>
                                    {getSkillStatusIcon(skill.average, skill.requiredRating)}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {skill.description || 'No description available'}
                                </p>
                                <p className="text-sm font-medium">
                                  Current Level: {skill.proficiencyDescription}
                                </p>
                                <div className="flex justify-between text-sm">
                                  <span>
                                    Self Assessment: {getSkillLevelLabel(skill.selfRating)}
                                  </span>
                                  <span>
                                    Manager Assessment: {getSkillLevelLabel(skill.managerRating)}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-4">
                              No skills data available for this employee
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Select
              value={limit === totalItems ? 'all' : limit.toString()}
              onValueChange={onLimitChange}
            >
              <SelectTrigger className="w-[120px]">
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
      </CardContent>
    </Card>
  );
}
