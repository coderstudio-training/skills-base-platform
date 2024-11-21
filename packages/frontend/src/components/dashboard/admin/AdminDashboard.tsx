'use client';

import AdminDashboardHeader from '@/components/shared/AdminDashboardHeader';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Employee } from '@/types/admin';
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
  Loader2,
  Network,
  Search,
  SlidersHorizontal,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from '../../ui/input';
import { Progress } from '../../ui/progress';

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
  //const [topSkills, setTopSkills] = useState<{ name: string; level: string }[]>([]);
  //const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [businessUnitStats, setBusinessUnitStats] = useState<{ name: string; count: number }[]>([]);
  const [goToPage, setGoToPage] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [employeeStats, setEmployeeStats] = useState({
    totalEmployeesCount: 0,
    businessUnitsCount: 0,
    activeEmployeesCount: 0,
  });
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

  return (
    <div className="container mx-auto p-4 mb-6">
      {/* Header */}
      <AdminDashboardHeader />

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
                  {unit}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or email..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
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
            <CardTitle className="font-semibold leading-none tracking-tight">Departments</CardTitle>
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
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold leading-none tracking-tight">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {/* {topSkills.map(skill => (
                <div key={skill.name} className="flex justify-between items-center">
                  <span>{skill.name}</span>
                  <Badge>{skill.level}</Badge>
                </div>
              ))} */}
            </div>
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
              {/* {skillGaps.map(skill => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{skill.name}</span>
                    <span>{skill.value.toFixed(1)}</span>
                  </div>
                  <Progress value={skill.value * 20} />
                </div>
              ))} */}
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
                            <Button variant="outline" size="sm">
                              View Skills
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>{`${employee.firstName} ${employee.lastName}'s Skills`}</DialogTitle>
                              <DialogDescription>Skill levels and proficiencies</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {/* JavaScript Skill */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">JavaScript</span>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={80} className="w-[100px]" />
                                    <span className="text-sm text-gray-500">Advanced</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Required Level: Expert</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Proficiency in JavaScript programming.
                                </p>
                                <p className="text-sm font-medium">
                                  Current Level: Creates advanced frameworks
                                </p>
                                <div className="flex justify-between text-sm">
                                  <span>Self Assessment: Advanced</span>
                                  <span>Manager Assessment: Advanced</span>
                                </div>
                              </div>

                              {/* React Skill */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">React</span>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={60} className="w-[100px]" />
                                    <span className="text-sm text-gray-500">Intermediate</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Required Level: Advanced</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Proficiency in React library for building user interfaces.
                                </p>
                                <p className="text-sm font-medium">
                                  Current Level: Develops moderate complexity React applications
                                </p>
                                <div className="flex justify-between text-sm">
                                  <span>Self Assessment: Advanced</span>
                                  <span>Manager Assessment: Intermediate</span>
                                </div>
                              </div>

                              {/* Python Skill */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">Python</span>
                                  <div className="flex items-center space-x-2">
                                    <Progress value={40} className="w-[100px]" />
                                    <span className="text-sm text-gray-500">Basic</span>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <XCircle className="h-5 w-5 text-red-500" />
                                        </TooltipTrigger>
                                        <TooltipContent>Required Level: Advanced</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  Proficiency in Python programming language.
                                </p>
                                <p className="text-sm font-medium">
                                  Current Level: Can perform simple scripting tasks
                                </p>
                                <div className="flex justify-between text-sm">
                                  <span>Self Assessment: Basic</span>
                                  <span>Manager Assessment: Basic</span>
                                </div>
                              </div>
                            </div>
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
      </Tabs>
    </div>
  );
}
