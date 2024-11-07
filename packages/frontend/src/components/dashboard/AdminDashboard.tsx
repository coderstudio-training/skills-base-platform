'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Upload,
  Download,
  Loader2,
  Check,
  X,
  Award,
  Users,
  TrendingUp,
  LogOut,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dummyAdminData } from '@/lib/dummyData';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [adminData] = useState(dummyAdminData);
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

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staffs</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminData.totalStaffs}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Departments</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminData.totalDepartments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminData.averagePerformance}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skill Growth</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{adminData.skillGrowth}%</div>
                <p className="text-xs text-muted-foreground">From last quarter</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trend</CardTitle>
                <CardDescription>
                  Organization-wide performance over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={adminData.performanceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="performance"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Average performance scores by department</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={adminData.departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="performance" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Skills</CardTitle>
                <CardDescription>Most prevalent skills across the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.topSkills.map((skill, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{skill.name}</span>
                      <Progress value={skill.prevalence} className="w-[200px]" max={100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Skill Gaps</CardTitle>
                <CardDescription>Areas where skill improvement is needed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adminData.skillGaps.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span>{skill.name}</span>
                        <span className="text-sm text-muted-foreground">Gap: {skill.gap}%</span>
                      </div>
                      <Progress value={skill.currentLevel} className="w-full" max={100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Staffs with the highest performance scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminData.topPerformers.map((staff, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-muted-foreground">{staff.department}</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <Progress
                        value={staff.performanceScore}
                        className="w-[100px] mr-2"
                        max={100}
                      />
                      <span className="font-medium">{staff.performanceScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="development">
          <Card>
            <CardHeader>
              <CardTitle>Learning & Development</CardTitle>
              <CardDescription>Overview of training and development activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total Training Hours</span>
                  <span className="font-semibold">{adminData.totalTrainingHours} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Staffs in Training Programs</span>
                  <span className="font-semibold">
                    {adminData.staffsInTraining} (
                    {((adminData.staffsInTraining / adminData.totalStaffs) * 100).toFixed(2)}
                    %)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Average Training Satisfaction</span>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">
                      {adminData.averageTrainingSatisfaction.toFixed(1)}/5
                    </span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Award
                          key={star}
                          className={`h-4 w-4 ${star <= Math.round(adminData.averageTrainingSatisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
