'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { EmployeeSkillsResponse, userSkillsApi } from '@/lib/api';
import { dummyStaffData } from '@/lib/dummyData';
import { StaffData } from '@/types/staff';
import { Award, BookOpen, LogOut, Scroll, TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartDataPoint {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  category: string;
}

const SOFT_SKILLS_COUNT = 10;

const calculateRequiredLevel = (
  currentLevel: number,
  skillGaps: Record<string, number>,
  skill: string,
) =>
  currentLevel > (skillGaps[skill] || 0)
    ? currentLevel - (skillGaps[skill] || 0)
    : currentLevel + (skillGaps[skill] || 0);

const transformDataForChart = (data: EmployeeSkillsResponse | null): ChartDataPoint[] => {
  if (!data?.user) return [];

  const skillEntries = Object.entries(data.user.skillAverages);

  const technicalSkills = skillEntries.slice(SOFT_SKILLS_COUNT).map(([skill, currentLevel]) => ({
    skill,
    currentLevel,
    requiredLevel: calculateRequiredLevel(currentLevel, data.user.skillGaps, skill),
    gap: data.user.skillGaps[skill] || 0,
    category: 'Technical',
  }));

  return technicalSkills;
};

const getGapStatus = (gap: number) => {
  if (gap < -2)
    return {
      text: 'Significant Gap',
      className: 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm',
    };
  if (gap < 0)
    return {
      text: 'Developing',
      className: 'text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full text-sm',
    };
  if (gap < 1)
    return {
      text: 'Meeting Requirements',
      className: 'text-green-500 bg-green-100 px-2 py-1 rounded-full text-sm',
    };
  return {
    text: 'Proficient',
    className: 'text-blue-500 bg-blue-100 px-2 py-1 rounded-full text-sm',
  };
};

export default function StaffDashboard() {
  const [employeeSkillsResponse, setEmployeeSkillsResponse] =
    useState<EmployeeSkillsResponse | null>(null);
  const { data: session } = useSession();
  const [staffData] = useState<StaffData>(dummyStaffData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testEmail = 'erneljohn.burgos@stratpoint.com';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userSkillsApi.getUserSkillsData(testEmail);
      setEmployeeSkillsResponse(response);
    } catch (err) {
      console.error('Error fetching skill gaps:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = transformDataForChart(employeeSkillsResponse);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{staffData.name}</h1>
          <p className="text-muted-foreground">
            {staffData.role} - {staffData.department}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
            <AvatarFallback>{staffData.name[0]}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{session?.user?.name || staffData.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">My Skills</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="learning">Learning Paths</TabsTrigger>
          <TabsTrigger value="network">My Network</TabsTrigger>
          <TabsTrigger value="career">Career Paths</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffData.skills.length}</div>
                <p className="text-xs text-muted-foreground">Total skills</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffData.learningPaths.length}</div>
                <p className="text-xs text-muted-foreground">Active paths</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {staffData.performanceMetrics.currentScore}%
                </div>
                <p className="text-xs text-muted-foreground">Current score</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network</CardTitle>
                <Scroll className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{staffData.network.length}</div>
                <p className="text-xs text-muted-foreground">Connections</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>My Skills</CardTitle>
              <CardDescription>Your current skill levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={staffData.skills}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Skills"
                    dataKey="level"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent> */}
        <TabsContent value="skills">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>
                Skills Gap Analysis -{' '}
                {employeeSkillsResponse?.user.nameOfResource || staffData.name}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {employeeSkillsResponse?.user.careerLevel || staffData.role} -{' '}
                {employeeSkillsResponse?.user.capability || staffData.department}
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="skill" tick={{ fill: '#666' }} tickLine={false} />
                        <YAxis
                          domain={[0, 6]}
                          ticks={[0, 0.9, 1.8, 2.7, 3.6, 4.5, 6]}
                          tick={{ fill: '#666' }}
                          tickLine={false}
                        />
                        <Tooltip />
                        <Bar
                          dataKey="currentLevel"
                          fill="#4285f4"
                          name="Current Level"
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar
                          dataKey="requiredLevel"
                          fill="#666666"
                          name="Required Level"
                          radius={[4, 4, 0, 0]}
                        />
                        <Legend
                          wrapperStyle={{
                            bottom: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            marginTop: '10px',
                            fontSize: '12px',
                          }}
                          payload={[
                            { value: 'Current Level', type: 'square', color: '#4285f4' },
                            { value: 'Required Level', type: 'square', color: '#666666' },
                          ]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Skill Details</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Breakdown of your skills, assessments, and required levels
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr className="text-left">
                            <th className="pb-2">Skill</th>
                            <th className="pb-2">Current Level</th>
                            <th className="pb-2">Required Level</th>
                            <th className="pb-2">Gap</th>
                            <th className="pb-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {chartData.map((item, index) => {
                            const gapStatus = getGapStatus(item.gap);
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="py-3">{item.skill}</td>
                                <td className="py-3">{item.currentLevel.toFixed(1)}</td>
                                <td className="py-3">{item.requiredLevel.toFixed(1)}</td>
                                <td className="py-3">{item.gap.toFixed(1)}</td>
                                <td className="py-3">
                                  <span className={gapStatus.className}>{gapStatus.text}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications">
          <Card>
            <CardHeader>
              <CardTitle>Qualifications</CardTitle>
              <CardDescription>Your certifications and degrees</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {staffData.qualifications.map((qual, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>{qual.name}</span>
                    <Badge>{qual.date}</Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle>Learning Paths</CardTitle>
              <CardDescription>Your current learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {staffData.learningPaths.map((path, index) => (
                  <li key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span>{path.name}</span>
                      <span>{path.progress}%</span>
                    </div>
                    <Progress value={path.progress} className="w-full" />
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="network">
          <Card>
            <CardHeader>
              <CardTitle>My Network</CardTitle>
              <CardDescription>Your professional connections</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {staffData.network.map((connection, index) => (
                  <li key={index} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>{connection.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{connection.name}</p>
                      <p className="text-sm text-muted-foreground">{connection.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="career">
          <Card>
            <CardHeader>
              <CardTitle>Career Paths</CardTitle>
              <CardDescription>Potential career progression</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {staffData.careerPaths.map((path, index) => (
                  <li key={index}>
                    <p className="font-medium">{path.role}</p>
                    <p className="text-sm text-muted-foreground">
                      Required Skills: {path.requiredSkills.join(', ')}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
