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
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Boxes,
  Building2,
  Check,
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
import { useState } from 'react';
import { Input } from '../ui/input';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Business Units');
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

  const businessUnits = [
    'All Business Units',
    'Software QA Services',
    'Software Development',
    'Data Science',
    'Cloud Services',
    'Cybersecurity',
  ];

  const userDirectory = [
    {
      initials: 'JD',
      name: 'John Doe',
      email: 'john@example.com',
      level: 'Professional II',
      department: 'Software QA Services',
      skills: ['JavaScript', 'Selenium', 'Test Planning'],
    },
    {
      initials: 'JS',
      name: 'Jane Smith',
      email: 'jane@example.com',
      level: 'Professional III',
      department: 'Software Development',
      skills: ['React', 'JavaScript', 'Python'],
    },
    {
      initials: 'AJ',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      level: 'Professional II',
      department: 'Data Science',
      skills: ['Python for Data Science', 'Tableau', 'R'],
    },
  ];

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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleBusinessUnitChange = (unit: string) => {
    setSelectedBusinessUnit(unit);
  };

  const filteredUsers = userDirectory.filter(user => {
    const matchesSearch =
      searchQuery === '' ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBusinessUnit =
      selectedBusinessUnit === 'All Business Units' || user.department === selectedBusinessUnit;

    return matchesSearch && matchesBusinessUnit;
  });

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

      {/* Updated Search Bar */}
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
                  className="flex items-center justify-between"
                  onSelect={() => handleBusinessUnitChange(unit)}
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
              placeholder="Search users or skills..."
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
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Average Skill Level</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">3.5</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Top Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'JavaScript', level: 'Advanced' },
                { name: 'Selenium', level: 'Advanced' },
                { name: 'React', level: 'Advanced' },
                { name: 'Tableau', level: 'Advanced' },
                { name: 'Python for Data Science', level: 'Intermediate' },
              ].map(skill => (
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
            <CardTitle className="text-sm font-medium">Skill Gap Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Python for Data Science', value: 1.7 },
                { name: 'Test Planning', value: 1.5 },
                { name: 'Tableau', value: 1.4 },
              ].map(skill => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{skill.name}</span>
                    <span>{skill.value}</span>
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
            <CardTitle className="text-sm font-medium">Department Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { name: 'Software QA Services', value: '15' },
                { name: 'Software Development', value: '25' },
                { name: 'Data Science', value: '20' },
              ].map(dept => (
                <div key={dept.name} className="flex justify-between items-center">
                  <span>{dept.name}</span>
                  <Badge>{dept.value}</Badge>
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

      {/* Updated User Directory */}
      <Card>
        <CardHeader>
          <CardTitle>User Directory</CardTitle>
          <p className="text-sm text-gray-500">
            {filteredUsers.length === 0
              ? 'No users found matching your search criteria'
              : 'View and manage users and their skills'}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div
                key={user.email}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {user.initials}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge>{user.level}</Badge>
                  <Badge>{user.department}</Badge>
                  <Badge className="bg-green-500 text-white">Active</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
                  >
                    View Skills
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
