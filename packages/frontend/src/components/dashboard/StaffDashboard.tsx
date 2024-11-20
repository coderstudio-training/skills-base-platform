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
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSkillMatrix } from '@/lib/api';
import { dummyStaffData } from '@/lib/dummyData';
import { StaffData, StaffSkill } from '@/types/staff';
import { Award, BookOpen, LogOut, Scroll, TrendingUp } from 'lucide-react';
import { ResponsiveContainer } from 'recharts';
import { CustomBarChart } from '../ui/barchart';

const getGapStatus = (gap: number) => {
  if (gap < -2)
    return {
      text: 'Critical',
      className: 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm',
    };
  if (gap < 0)
    return {
      text: 'Developing',
      className: 'text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full text-sm',
    };
  if (gap < 1)
    return {
      text: 'Sufficient',
      className: 'text-green-500 bg-green-100 px-2 py-1 rounded-full text-sm',
    };
  return {
    text: 'Proficient',
    className: 'text-blue-500 bg-blue-100 px-2 py-1 rounded-full text-sm',
  };
};

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [staffData] = useState<StaffData>(dummyStaffData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<StaffSkill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
    'Technical Skills',
  );

  useEffect(() => {
    const fetchSkills = async () => {
      if (!session?.user?.email) {
        setError('User email not found in session');
        return;
      }
      setLoading(true);
      try {
        const data = await getSkillMatrix();
        setSkills(data.skills);
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Failed to fetch skills data';
        console.error('Error fetching skills data:', err);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchSkills();
  }, [session]);

  const filteredSkills = skills.filter(skill => skill.category === selectedCategory);

  const transformedChartData = filteredSkills.map(skill => ({
    skill: skill.skill,
    selfRating: skill.selfRating,
    managerRating: skill.managerRating,
    average: skill.average,
    requiredRating: skill.requiredRating,
    [skill.skill]: skill.average, // This is needed for the chart to work properly
  }));

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{session?.user?.name}</h1>
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
        <TabsContent value="skills">
          <Card className="w-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Skills Gap Analysis</CardTitle>
                <div className="space-x-2">
                  <Button
                    variant={selectedCategory === 'Technical Skills' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('Technical Skills')}
                  >
                    Technical Skills
                  </Button>
                  <Button
                    variant={selectedCategory === 'Soft Skills' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory('Soft Skills')}
                  >
                    Soft Skills
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <>
                  <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height={500}>
                      <CustomBarChart
                        data={transformedChartData}
                        xAxisKey="skill"
                        series={[
                          { key: 'average', name: 'Current Level', color: '#4285f4' },
                          { key: 'requiredRating', name: 'Required Level', color: '#666666' },
                        ]}
                        title="Skills Gap Analysis"
                      />
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-2">Skill Details</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Breakdown of your {selectedCategory.toLowerCase()}
                    </p>

                    <div className="rounded-md border">
                      <div className="bg-white border-b">
                        <table className="w-full">
                          <thead>
                            <tr className="text-left">
                              <th
                                className="py-4 px-6 font-medium w-[30%]"
                                style={{ paddingLeft: '24px' }}
                              >
                                Skill
                              </th>
                              <th className="py-4 px-6 font-medium w-[20%]">Self Rating</th>
                              <th className="py-4 px-6 font-medium w-[20%]">Manager Rating</th>
                              <th className="py-4 px-6 font-medium w-[15%] text-center">
                                Required Level
                              </th>
                              <th className="py-4 px-6 font-medium w-[15%]">Status</th>
                            </tr>
                          </thead>
                        </table>
                      </div>

                      <ScrollArea className="h-[360px]">
                        <div className="px-4">
                          <table className="w-full">
                            <tbody className="divide-y">
                              {filteredSkills.map((skill, index) => {
                                const status = getGapStatus(skill.gap);
                                return (
                                  <tr key={index} className="hover:bg-gray-50">
                                    <td
                                      className="py-4 px-6 w-[30%]"
                                      style={{ paddingLeft: '24px' }}
                                    >
                                      {skill.skill}
                                    </td>
                                    <td className="py-4 px-6 w-[20%]">
                                      <div className="flex items-center gap-4">
                                        <Progress value={skill.selfRating * 20} className="w-32" />
                                        <span className="text-sm font-medium w-4">
                                          {skill.selfRating}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 w-[20%]">
                                      <div className="flex items-center gap-4">
                                        <Progress
                                          value={skill.managerRating * 20}
                                          className="w-32"
                                        />
                                        <span className="text-sm font-medium w-4">
                                          {skill.managerRating}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 w-[15%] text-center">
                                      <span className="text-sm font-medium">
                                        {skill.requiredRating}
                                      </span>
                                    </td>
                                    <td className="py-4 px-6 w-[15%]">
                                      <span className={status.className}>{status.text}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </ScrollArea>
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
