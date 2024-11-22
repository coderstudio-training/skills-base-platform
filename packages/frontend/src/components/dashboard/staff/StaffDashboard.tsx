'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEffect, useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StaffDashboardHeader from '@/components/shared/StaffDashboardHeader';
import { CustomBarChart } from '@/components/ui/barchart';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSkillMatrix } from '@/lib/api';
import { StaffSkill } from '@/types/staff';
import { Award, Scroll, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ResponsiveContainer } from 'recharts';

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

// Mock skills data
const mockSkillsData = [
  {
    skill: 'Software Testing',
    category: 'Technical Skills',
    selfRating: 4,
    managerRating: 3,
    requiredRating: 4,
  },
  {
    skill: 'Test Planning',
    category: 'Technical Skills',
    selfRating: 3,
    managerRating: 3,
    requiredRating: 4,
  },
  {
    skill: 'Agile Software Development',
    category: 'Technical Skills',
    selfRating: 4,
    managerRating: 4,
    requiredRating: 3,
  },
  {
    skill: 'Problem Solving',
    category: 'Soft Skills',
    selfRating: 4,
    managerRating: 4,
    requiredRating: 4,
  },
  {
    skill: 'Communication',
    category: 'Soft Skills',
    selfRating: 3,
    managerRating: 4,
    requiredRating: 4,
  },
  {
    skill: 'Collaboration and Inclusivity',
    category: 'Soft Skills',
    selfRating: 4,
    managerRating: 3,
    requiredRating: 3,
  },
];

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<StaffSkill[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
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

  const averageRating = (category: string) => {
    const filteredSkills = mockSkillsData.filter(skill => skill.category === category);
    const sum = filteredSkills.reduce((acc, skill) => acc + skill.selfRating, 0);
    return (sum / filteredSkills.length).toFixed(2);
  };

  return (
    <div className="container mx-auto p-4 max-w-[80%]">
      <StaffDashboardHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Details</TabsTrigger>
          <TabsTrigger value="growth-plan">Growth Plan</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Soft Skills Average</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageRating('Soft Skills')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Technical Skills Average</CardTitle>
                <Scroll className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageRating('Technical Skills')}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Skills Assessed</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockSkillsData.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Skills Overview</CardTitle>
              <CardDescription>
                Your current skill levels compared to required levels
              </CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
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
      </Tabs>
    </div>
  );
}
