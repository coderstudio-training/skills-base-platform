'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Progress } from "@/components/ui/progress"
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, TrendingUp, Trophy, Upload, Users } from 'lucide-react';

import ManagerDashboardHeader from '@/components/shared/ManagerDashboardHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { ManagerData } from '@/types/manager'
// import { dummyManagerData } from '@/lib/dummyData'

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

interface TeamMember {
  employeeId: number;
  firstName: string;
  lastName: string;
  designation: string;
  email?: string;
  performanceScore?: number;
  managerName?: string;
  picture?: string;
}

export default function ManagerDashboard() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState<string>('6m');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [membersWithPictures, setMembersWithPictures] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //   const [managerData, setManagerData] = useState<ManagerData>(dummyManagerData)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const token = session?.user?.accessToken;

        const response = await fetch(
          `/api/employees/manager/${encodeURIComponent(session?.user?.name || '')}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();
        setTeamMembers(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching team members:', err);
        setError('Failed to fetch team members. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.name) {
      fetchTeamMembers();
    }
  }, [session?.user?.name, session?.user?.accessToken]);

  useEffect(() => {
    const fetchUserPictures = async () => {
      if (!teamMembers.length) return;

      const updatedMembers = await Promise.all(
        teamMembers.map(async member => {
          if (!member.email) return member;

          try {
            const response = await fetch(`/api/users/picture/${encodeURIComponent(member.email)}`, {
              headers: {
                Authorization: `Bearer ${session?.user?.accessToken}`,
              },
            });
            const data = await response.json();
            return { ...member, picture: data.picture };
          } catch (error) {
            console.error(`Error fetching picture for ${member.email}:`, error);
            return member;
          }
        }),
      );

      setMembersWithPictures(updatedMembers);
    };

    fetchUserPictures();
  }, [teamMembers, session?.user?.accessToken]);

  const handleExportReport = async () => {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    alert('Report exported successfully!');
  };

  return (
    <div className="container mx-auto p-4">
      <ManagerDashboardHeader />

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
        </div>
        <Select value={timeRange} onValueChange={(value: string) => setTimeRange(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="team-skills">Team Skills</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Metrics Grid */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm text-gray-500">Team Size</h3>
                </div>
                <p className="text-3xl font-bold mt-2">12</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm text-gray-500">Average Performance</h3>
                </div>
                <p className="text-3xl font-bold mt-2">87%</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gray-500" />
                  <h3 className="text-sm text-gray-500">Skill Growth</h3>
                </div>
                <p className="text-3xl font-bold mt-2">+15%</p>
                <p className="text-sm text-gray-500">In the last 6 months</p>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Grid */}
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            {/* Team Composition */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-1">Team Composition</h3>
                <p className="text-sm text-gray-500 mb-4">Distribution of roles in your team</p>
                <div className="h-48 bg--100 rounded-lg" />
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-bold mb-1">Team Members List</h3>
                <p className="text-sm text-gray-500 mb-4">List of your team members</p>
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
                              <p className="text-sm text-gray-500">{member.designation}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {member.performanceScore && (
                              <span className="font-medium">{member.performanceScore}%</span>
                            )}
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
          </div>
        </TabsContent>

        <TabsContent value="performance">
          {/* Team Performance Trend Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">Team Performance Trend</h3>
              <p className="text-sm text-gray-500 mb-4">
                Average team performance over the last 6 months
              </p>
              <div className="w-full">
                {/* <BarChart
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
                </BarChart> */}
              </div>
            </CardContent>
          </Card>

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
                            <p className="text-sm text-gray-500">{member.designation}</p>
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

        <TabsContent value="team-skills">
          {/* Team Performance Trend Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">Team Performance Trend</h3>
              <p className="text-sm text-gray-500 mb-4">
                Average team performance over the last 6 months
              </p>
              <div className="w-full">
                {/* <BarChart
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
                </BarChart> */}
              </div>
            </CardContent>
          </Card>

          {/* Individual Performance Card */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold">Team Skills Breakdown</h3>
              <p className="text-sm text-gray-500 mb-4">Detailed view of individual skills</p>
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
                          <div className="flex-1">
                            <p className="font-medium">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{member.designation}</p>
                            <div className="flex flex-wrap gap-2">
                              <Badge>Automated Testing</Badge>
                              <Badge>Manual Testing</Badge>
                              <Badge>Performance Testing</Badge>
                            </div>
                          </div>
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

        <TabsContent value="development">{/* Development content */}</TabsContent>
      </Tabs>
    </div>
  );
}
