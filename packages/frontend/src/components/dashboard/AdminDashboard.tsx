'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@radix-ui/react-select';
import {
  BarChart3,
  Boxes,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  GraduationCap,
  Loader2,
  LogOut,
  Search,
  SlidersHorizontal,
  Target,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  employmentStatus: string;
  grade: string;
  skills?: { name: string; level: string }[];
}

interface PaginatedResponse {
  items: Employee[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SkillGap {
  name: string;
  value: number;
}

interface DepartmentStats {
  name: string;
  count: number;
}

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
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
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
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/employees?page=${page}&limit=${limit}`);

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data: PaginatedResponse = await response.json();
        setEmployees(data.items);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);

        // Calculate top skills, skill gaps, and department distribution
        calculateMetrics(data.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching employees:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchEmployees();
    }
  }, [page, limit, session]);

  const calculateMetrics = (employees: Employee[]) => {
    // Calculate department statistics
    const deptCounts = new Map<string, number>();
    employees.forEach(emp => {
      const count = deptCounts.get(emp.department) || 0;
      deptCounts.set(emp.department, count + 1);
    });

    setDepartmentStats(
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

  // Client-side filtering for search and business unit
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const matchesSearch =
      searchQuery === '' ||
      fullName.includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBusinessUnit =
      selectedBusinessUnit === 'All Business Units' || employee.department === selectedBusinessUnit;

    return matchesSearch && matchesBusinessUnit;
  });

  const activeEmployees = employees.filter(emp => emp.employmentStatus === 'Active').length;
  const departmentsCount = new Set(employees.map(emp => emp.department)).size;

  // Get departments for the dropdown
  const businessUnits = [
    'All Business Units',
    ...Array.from(new Set(employees.map(emp => emp.department))),
  ];

  // Handlers remain the same but only page and limit affect the API call
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
    setLimit(Number(newLimit));
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

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="bg-red-50">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-red-700">Error Loading Dashboard</h2>
            <p className="text-red-600">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Skills Base Platform Overview</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">{session?.user?.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

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
              placeholder="Search by name, email, or department..."
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
            <p className="text-3xl font-bold">{departmentsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold leading-none tracking-tight">
              Active Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeEmployees}</p>
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
              Department Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {departmentStats.map(dept => (
                <div key={dept.name} className="flex justify-between items-center">
                  <span>{dept.name}</span>
                  <Badge>{dept.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        {[
          { icon: <Users className="h-4 w-4" />, label: 'Users' },
          { icon: <Boxes className="h-4 w-4" />, label: 'Skills' },
          { icon: <Target className="h-4 w-4" />, label: 'Required Skills' },
          { icon: <Building2 className="h-4 w-4" />, label: 'Organization' },
          { icon: <BarChart3 className="h-4 w-4" />, label: 'Metrics' },
          { icon: <GraduationCap className="h-4 w-4" />, label: 'Learning' },
        ].map((tab, index) => (
          <Button key={tab.label} variant={index === 0 ? 'default' : 'ghost'} className="gap-2">
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Employee Directory */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <p className="text-sm text-gray-500">
            {loading
              ? 'Loading...'
              : filteredEmployees.length === 0
                ? 'No employees found matching your search criteria'
                : `Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, totalItems)} of ${totalItems} employees`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              filteredEmployees.map((employee, index) => (
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
                    <Badge>{employee.grade}</Badge>
                    <Badge>{employee.department}</Badge>
                    <Badge
                      className={
                        employee.employmentStatus === 'Active'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }
                    >
                      {employee.employmentStatus}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
                    >
                      View Skills
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Select value={limit.toString()} onValueChange={handleLimitChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={page === 1 || loading}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={page === totalPages || loading}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
