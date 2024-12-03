'use client';

import { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from "@/components/ui/progress"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import ManagerSkillsView from '@/components/dashboard/components/manager/ManagerSkillsView';
import ManagerTrainingRecommendation from '@/components/dashboard/components/manager/ManagerTrainingRecommendation';
import TeamCompositionChart from '@/components/dashboard/components/manager/TeamCompositionChart';
import TeamMembersList from '@/components/dashboard/components/manager/TeamMembersList';
import TeamStatsCard from '@/components/dashboard/components/manager/TeamStatsCards';
import ManagerDashboardHeader from '@/components/shared/ManagerDashboardHeader';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/api/hooks';
import { getUserPicture } from '@/lib/users/api';
import { getTeamMembers } from '@/lib/users/employees/api';
import { TeamMember } from '@/types/manager';
// import { ManagerData } from '@/types/manager'
// import { dummyManagerData } from '@/lib/dummyData'

const topPerformers = [
  { name: 'Alice Johnson', role: 'Senior QA Engineer', performanceScore: 95 },
  { name: 'Bob Smith', role: 'QA Analyst', performanceScore: 92 },
  { name: 'Charlie Davis', role: 'QA Engineer', performanceScore: 90 },
  { name: 'Diana Miller', role: 'Senior QA Engineer', performanceScore: 89 },
  { name: 'Edward Wilson', role: 'QA Analyst', performanceScore: 88 },
];

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [membersWithPictures, setMembersWithPictures] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState<string | null>(null);

  // I suggest using hook.ts for client side or do server side rendering like skills/taxonomy/[businessUnit]
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        if (!user?.name) {
          setError('Name is missing!');
          throw new Error('Name is missing!');
        }

        const response = await getTeamMembers(user?.name);

        if (response.error || response.data === null) {
          throw new Error(`Error fetching team members: ${error}`);
        }

        setTeamMembers(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to fetch team members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.name) {
      fetchTeamMembers();
    }
  }, [user?.name]);

  useEffect(() => {
    const fetchUserPictures = async () => {
      if (!teamMembers.length) return;

      const updatedMembers = await Promise.all(
        teamMembers.map(async member => {
          if (!member.email) return member;
          try {
            const response = await getUserPicture(member.email);
            if (response.error || response.data === null) {
              throw new Error(`Error fetching team members' photos: ${error}`);
            }
            return { ...member, picture: response.data.picture };
          } catch (error) {
            console.error(`Error fetching picture for ${member.email}:`, error);
            return member;
          }
        }),
      );

      setMembersWithPictures(updatedMembers);
    };

    fetchUserPictures();
  }, [teamMembers]);

  return (
    <div className="container mx-auto p-4 max-w-[80%]">
      {/* Header */}
      <ManagerDashboardHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Team Stats */}
          <TeamStatsCard teamSize={teamMembers.length} averagePerformance={87} skillGrowth={15} />

          {/* Bottom Grid */}
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {/* Team Composition */}
            <TeamCompositionChart teamMembers={membersWithPictures} loading={loading} />

            {/* Team Members List */}
            <TeamMembersList loading={loading} error={error} members={membersWithPictures} />
          </div>
        </TabsContent>

        <TabsContent value="performance">
          {/* Team Performance Trend Card */}
          {/* <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">Team Performance Trend</h3>
              <p className="text-sm text-gray-500 mb-4">
                Average team performance over the last 6 months
              </p>
              <div className="w-full">
                <BarChart
                  width={800}
                  height={300}
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip />
                  <Bar dataKey="performance" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </div>
            </CardContent>
          </Card> */}

          {/* Individual Performance Card */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">Individual Performance</h3>
              <p className="text-sm text-gray-500 mb-4">Performance scores of team members</p>
              <ScrollArea className="h-[300px] w-full">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Loading team members...</p>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-500">
                    <p>{error}</p>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {membersWithPictures.map(member => (
                      <div
                        key={member.email}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {member.picture ? (
                              <AvatarImage
                                src={member.picture}
                                alt={`${member.firstName} ${member.lastName}`}
                                width={40}
                                height={40}
                                onError={e => {
                                  const imgElement = e.target as HTMLImageElement;
                                  imgElement.style.display = 'none';
                                }}
                              />
                            ) : null}
                            <AvatarFallback className="uppercase bg-gray-100 text-gray-600">
                              {member.firstName?.[0]}
                              {member.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{`${member.jobLevel} ${member.designation}`}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-black rounded-full"
                              style={{ width: `90%` }}
                            />
                          </div>
                          <span className="font-medium w-12 text-right">90%</span>
                        </div>
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <div className="text-center text-gray-500">No team members found</div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills">
          {/* Team Performance Trend Card */}
          {/* <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">Team Performance Trend</h3>
              <p className="text-sm text-gray-500 mb-4">
                Average team performance over the last 6 months
              </p>
              <div className="w-full">
                <BarChart
                  width={800}
                  height={300}
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} />
                  <Tooltip />
                  <Bar dataKey="performance" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </div>
            </CardContent>
          </Card> */}

          {/* Individual Performance Card */}
          <ManagerSkillsView />
        </TabsContent>

        <TabsContent value="training">
          {' '}
          <ManagerTrainingRecommendation />
        </TabsContent>
        <TabsContent value="evaluation">
          <Card>
            <CardHeader>
              <CardTitle>Team Evaluation</CardTitle>
              <CardDescription>
                Conduct performance evaluations for your team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">Select a team member to start their performance evaluation:</p>
              <Select>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {topPerformers.map((member, index) => (
                    <SelectItem key={index} value={member.name.toLowerCase().replace(' ', '-')}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Evaluation Criteria</h3>
                <div className="space-y-4">
                  {[
                    'Technical Skills',
                    'Communication',
                    'Teamwork',
                    'Problem Solving',
                    'Initiative',
                  ].map((criteria, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{criteria}</span>
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select rating" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map(rating => (
                            <SelectItem key={rating} value={rating.toString()}>
                              {rating} -{' '}
                              {rating === 1
                                ? 'Poor'
                                : rating === 2
                                  ? 'Fair'
                                  : rating === 3
                                    ? 'Good'
                                    : rating === 4
                                      ? 'Very Good'
                                      : 'Excellent'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Comments</h3>
                <textarea
                  className="w-full h-32 p-2 border rounded-md"
                  placeholder="Enter your comments here..."
                ></textarea>
              </div>
              <Button className="mt-4">Submit Evaluation</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
