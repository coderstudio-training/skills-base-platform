'use client';

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
import { BusinessUnitStats, Employee, SkillGap } from '@/types/admin';
import { PaginatedEmployeeResponse } from '@/types/api';
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
  Settings,
  SlidersHorizontal,
  Upload,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Business Units');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [topSkills, setTopSkills] = useState<{ name: string; level: string }[]>([]);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [businessUnitStats, setBusinessUnitStats] = useState<BusinessUnitStats[]>([]);
  const [goToPage, setGoToPage] = useState<string>('');
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

  const calculateMetrics = (employees: Employee[]) => {
    // Calculate business unit statistics, excluding empty business units
    const deptCounts = new Map<string, number>();
    employees.forEach(emp => {
      // Only count business units that aren't empty strings
      if (emp.businessUnit && emp.businessUnit.trim() !== '') {
        const count = deptCounts.get(emp.businessUnit) || 0;
        deptCounts.set(emp.businessUnit, count + 1);
      }
    });

    setBusinessUnitStats(
      Array.from(deptCounts.entries()).map(([name, count]) => ({
        name,
        count,
      })),
    );

    // Mock data for top skills
    setTopSkills([
      { name: 'JavaScript', level: 'Advanced' },
      { name: 'Python', level: 'Advanced' },
      { name: 'React', level: 'Advanced' },
      { name: 'SQL', level: 'Advanced' },
      { name: 'AWS', level: 'Intermediate' },
    ]);

    // Mock data for skills gap
    setSkillGaps([
      { name: 'Machine Learning', value: 1.7 },
      { name: 'DevOps', value: 1.5 },
      { name: 'Kubernetes', value: 1.4 },
    ]);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        // Fetch all employees
        const response = await fetch(`/api/employees?limit=${Number.MAX_SAFE_INTEGER}`);

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data: PaginatedEmployeeResponse = await response.json();
        setEmployees(data.items);
        setTotalItems(data.total);

        // Calculate metrics with all employees
        calculateMetrics(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : `An error occurred ${error}`);
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchEmployees();
    }
  }, [session]);

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      fullName.includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.businessUnit.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBusinessUnit =
      selectedBusinessUnit === 'All Business Units' ||
      employee.businessUnit === selectedBusinessUnit;

    return matchesSearch && matchesBusinessUnit;
  });

  // Update total pages based on filtered results
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredEmployees.length / limit);
    setTotalPages(newTotalPages);

    // Reset to page 1 if current page is out of bounds
    if (page > newTotalPages && newTotalPages > 0) {
      setPage(1);
    }
  }, [filteredEmployees.length, limit]);

  const businessUnits = [
    'All Business Units',
    ...Array.from(
      new Set(employees.map(emp => emp.businessUnit).filter(unit => unit && unit.trim() !== '')),
    ),
  ];

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
  };

  const handleBusinessUnitChange = (unit: string) => {
    setSelectedBusinessUnit(unit);
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

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="container mx-auto p-4 mb-6">
      {/* Header */}
      <header className="bg-white border-b mb-6">
        <div className="h-16 mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <Badge variant="secondary">Data synced: Today 8:00 AM</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    {`AD`}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Admin User</DropdownMenuLabel>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

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
                <DropdownMenuItem
                  key={unit}
                  onClick={() => handleBusinessUnitChange(unit)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{unit}</span>
                  </div>
                  {unit === selectedBusinessUnit && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="relative w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, email, or BU..."
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
            <p className="text-3xl font-bold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold leading-none tracking-tight">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {
                new Set(
                  employees.map(emp => emp.businessUnit).filter(unit => unit && unit.trim() !== ''),
                ).size
              }
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold leading-none tracking-tight">
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {employees.filter(emp => emp.employmentStatus === 'Active').length}
            </p>
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
              {topSkills.map(skill => (
                <div key={skill.name} className="flex justify-between items-center">
                  <span>{skill.name}</span>
                  <Badge>{skill.level}</Badge>
                </div>
              ))}
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
              {skillGaps.map(skill => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{skill.name}</span>
                    <span>{skill.value.toFixed(1)}</span>
                  </div>
                  <Progress value={skill.value * 20} />
                </div>
              ))}
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
                  filteredEmployees
                    .slice((page - 1) * limit, page * limit)
                    .map((employee, index) => (
                      <div
                        key={index}
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
                                <DialogDescription>
                                  Skill levels and proficiencies
                                </DialogDescription>
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
                    Showing{' '}
                    {filteredEmployees.length === 0
                      ? 0
                      : Math.min((page - 1) * limit + 1, filteredEmployees.length)}{' '}
                    - {Math.min(page * limit, filteredEmployees.length)} of{' '}
                    {filteredEmployees.length} items
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
