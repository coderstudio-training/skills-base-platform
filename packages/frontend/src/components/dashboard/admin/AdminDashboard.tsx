'use client';

import AdminDashboardHeader from '@/components/shared/AdminDashboardHeader';
import TSCManager from '@/components/TSC/TSCManager';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQueryTechnicalTaxonomy } from '@/lib/skills/api';
import { cn } from '@/lib/utils';
import { Employee, SkillDetail, TopPerformer, TopPerformersResponse } from '@/types/admin';
import { getSkillDescription } from '@/types/skill-description';
import {
  AlertTriangle,
  Award,
  BarChart2,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  Loader2,
  Network,
  Search,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '../../ui/input';
import { Progress } from '../../ui/progress';
import AnalysisView from './AnalysisView';
// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminDashboard() {
  //const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Business Units');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [businessUnitStats, setBusinessUnitStats] = useState<{ name: string; count: number }[]>([]);
  const [goToPage, setGoToPage] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [employeeStats, setEmployeeStats] = useState({
    totalEmployeesCount: 0,
    businessUnitsCount: 0,
    activeEmployeesCount: 0,
  });
  const [selectedEmployeeSkills, setSelectedEmployeeSkills] = useState<SkillDetail[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [skillGaps, setSkillGaps] = useState<
    { name: string; currentLevel: number; requiredLevel: number; gap: number }[]
  >([]);
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

  useEffect(() => {
    const fetchTopPerformers = async () => {
      try {
        const response = await fetch('/api/skills/rankings');
        if (!response.ok) throw new Error('Failed to fetch top performers');
        const data: TopPerformersResponse = await response.json();
        setTopPerformers(data.rankings.slice(0, 10));
      } catch (error) {
        console.error('Error fetching top performers:', error);
      }
    };

    fetchTopPerformers();
  }, []);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        const response = await fetch('/api/employees/business-units');
        if (!response.ok) {
          throw new Error('Failed to fetch business units');
        }
        const data = await response.json();
        console.log('Business units call: ', data, ' | Business units:', businessUnits);
        setBusinessUnits(['All Business Units', ...data.businessUnits]);
        setBusinessUnitStats(data.distribution);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch business units');
      }
    };

    fetchBusinessUnits();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(debouncedSearchQuery && { searchTerm: debouncedSearchQuery }),
          ...(selectedBusinessUnit !== 'All Business Units' && {
            businessUnit: selectedBusinessUnit,
          }),
        });

        const endpoint =
          debouncedSearchQuery || selectedBusinessUnit !== 'All Business Units'
            ? '/api/employees/search'
            : '/api/employees';

        const response = await fetch(`${endpoint}?${searchParams}`);

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();
        setEmployees(data.items);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : `An error occurred ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [debouncedSearchQuery, page, limit, selectedBusinessUnit]);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        const stats = await fetch('/api/employees/stats').then(res => res.json());
        setEmployeeStats(stats);
      } catch (err) {
        console.error('Error fetching employee statistics:', err);
      }
    };

    fetchEmployeeStats();
  }, []);

  useEffect(() => {
    const fetchSkillAnalytics = async () => {
      try {
        const response = await fetch('/api/skills/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch skill analytics');
        }
        const data = await response.json();
        setSkillGaps(data.skillGaps);
      } catch (err) {
        console.error('Error fetching skill analytics:', err);
      }
    };

    fetchSkillAnalytics();
  }, []);

  const fetchEmployeeSkills = async (email: string) => {
    try {
      const response = await fetch(`/api/skills/employee/${email}`);
      if (!response.ok) {
        throw new Error('Failed to fetch employee skills');
      }
      const data = await response.json();
      setSelectedEmployeeSkills(data.skills || []);
    } catch (error) {
      console.error('Error fetching employee skills:', error);
      setSelectedEmployeeSkills([]);
    }
  };

  const getSkillLevelLabel = (average: number) => {
    if (average <= 1) return 'Novaice';
    if (average <= 2) return 'Beginner';
    if (average <= 3) return 'Intermediate';
    if (average <= 4) return 'Advanced';
    if (average <= 5) return 'Expert';
    return 'Guru';
  };

  const renderSkillStatusIcon = (skill: SkillDetail) => {
    const progress = (skill.average / skill.requiredRating) * 100;

    if (progress >= 100) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </TooltipTrigger>
            <TooltipContent>Meets Required Level</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    if (progress >= 75) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </TooltipTrigger>
            <TooltipContent>Close to Required Level</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <XCircle className="h-5 w-5 text-red-500" />
          </TooltipTrigger>
          <TooltipContent>Below Required Level</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNumber = parseInt(goToPage);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        handlePageChange(pageNumber);
        setGoToPage('');
      } else {
        alert(`Please enter a valid page number between 1 and ${totalPages}`);
      }
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleBusinessUnitChange = (unit: string) => {
    setSelectedBusinessUnit(unit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: string) => {
    if (newLimit === 'all') {
      setLimit(totalItems);
    } else {
      setLimit(Number(newLimit));
    }
    setPage(1);
  };

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

  const { data: QA_Tsc, isLoading, error: queryError, refetch } = useQueryTechnicalTaxonomy('QA');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminDashboardHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
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
                    {status === 'idle' && (
                      <span className="text-muted-foreground">(Not synced)</span>
                    )}
                    {status === 'syncing' && <Loader2 className="h-4 w-4 animate-spin" />}
                    {status === 'success' && <Check className="h-4 w-4 text-green-500" />}
                    {status === 'error' && <X className="h-4 w-4 text-red-500" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[200px] justify-start">
                  <Building2 className="h-4 w-4" />
                  {selectedBusinessUnit}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px]">
                {businessUnits.map(unit => (
                  <DropdownMenuItem key={unit} onClick={() => handleBusinessUnitChange(unit)}>
                    <Building2 className="h-4 w-4 mr-2" />
                    {unit}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-8 w-[300px]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4" />{' '}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold leading-none tracking-tight">
                Total Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{employeeStats.totalEmployeesCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold leading-none tracking-tight">
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{employeeStats.businessUnitsCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold leading-none tracking-tight">
                Active Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{employeeStats.activeEmployeesCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold leading-none tracking-tight">
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-t-lg">
                <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-2">Rank</div>
                  <div className="col-span-8">Employee Name</div>
                  <div className="col-span-2 text-right">Score</div>
                </div>
              </div>

              <ScrollArea className="h-[350px]">
                <div className="divide-y">
                  {topPerformers.map(performer => (
                    <div
                      key={performer.ranking}
                      className={cn(
                        'grid grid-cols-12 px-4 py-3 items-center transition-colors hover:bg-muted/50',
                        performer.ranking <= 5 && 'bg-muted/20',
                      )}
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="font-medium">{performer.ranking}</span>
                      </div>
                      <div className="col-span-8">{performer.name}</div>
                      <div className="col-span-2 text-right">{performer.score}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {topPerformers.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No performers data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Gap Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold leading-none tracking-tight">
                Skill Gap Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillGaps.map(skill => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <span>{skill.gap.toFixed(1)}</span>
                    </div>
                    <Progress
                      value={(skill.currentLevel / skill.requiredLevel) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
                {skillGaps.length === 0 && (
                  <div className="text-center text-gray-500 py-4">No skill gaps identified</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="font-semibold leading-none tracking-tight">
                Business Unit Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {businessUnitStats.map(bu => (
                  <div key={bu.name} className="flex justify-between items-center">
                    <span>{bu.name}</span>
                    <Badge>{bu.count}</Badge>
                  </div>
                ))}
                {businessUnitStats.length === 0 && (
                  <div className="text-center text-gray-500 py-4">
                    No business unit data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Structure */}
        <Tabs defaultValue="users" className="space-y-4 mb-6">
          <TabsList>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="required-skills" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              Required Skills
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="taxonomy" className="flex iutems-center gap-2">
              <BookOpen className="h-4 w-4" />
              Taxonomy
            </TabsTrigger>
          </TabsList>

          {/* Employee Directory */}
          <TabsContent value="users">
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
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
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
                            className={
                              employee.employmentStatus === 'Active'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-500 text-white'
                            }
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
                                <DialogDescription>
                                  Skill levels and proficiencies
                                </DialogDescription>
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
                                            {renderSkillStatusIcon(skill)}
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                          {getSkillDescription(skill)}
                                        </p>
                                        <div className="flex justify-between text-sm">
                                          <span>
                                            Self Assessment:{' '}
                                            {getSkillLevelLabel(+skill.selfRating.toFixed(1))}
                                          </span>
                                          <span>
                                            Manager Assessment:{' '}
                                            {getSkillLevelLabel(+skill.managerRating.toFixed(1))}
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
                      onValueChange={handleLimitChange}
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
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1 || loading || limit === totalItems}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
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
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages || loading || limit === totalItems}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={page === totalPages || loading || limit === totalItems}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="metrics">
            <AnalysisView />
          </TabsContent>
          <TabsContent value="taxonomy">
            {queryError ? (
              <div>
                <p>Error loading TSCs: {queryError.message}</p>
                <button onClick={() => refetch()}>Retry</button>
              </div>
            ) : !isLoading && QA_Tsc ? (
              <TSCManager selectedBusinessUnit={selectedBusinessUnit} data={QA_Tsc} />
            ) : (
              <div>Loading ...</div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
