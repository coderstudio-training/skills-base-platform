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
import { dummyStaffData } from '@/lib/dummyData';
import { fetcherAuth } from '@/lib/fetch-data-auth';
import { FetchApiResponse, Taxonomy } from '@/types';
import { StaffData } from '@/types/staff';
import { Award, BookOpen, LogOut, Scroll, TrendingUp } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

export default function StaffDashboard() {
  const { data: session } = useSession();
  const [staffData] = useState<StaffData>(dummyStaffData);

  const [taxonomy_data, set_taxonomy_data] = useState<Taxonomy | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const response: FetchApiResponse<Taxonomy> = await fetcherAuth(
        {
          service: 'skills',
          endpoint: '/taxonomy/1yMsFZfwyumL4W7Erc0hr1IfM8_DsErcdri0TBEJRjq0',
          query: '?businessUnit=QA',
          method: 'GET',
        },
        session?.user?.accessToken,
      );

      if (response.error) {
        setError(response.error.message);
      } else {
        set_taxonomy_data(response.data);
        console.log('RESPONSE DATA TAXONOMY:', response.data);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!taxonomy_data) {
    return <div>Loading...</div>;
  }

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
          <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
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
        <TabsContent value="taxonomy">
          <Card>
            <CardHeader>
              <CardTitle>Taxonomy</CardTitle>
              <CardDescription>List of technical skills and descriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {taxonomy_data ? (
                  <>
                    <li key={taxonomy_data.docId} className="border-b pb-4">
                      <h3 className="text-lg font-semibold">{taxonomy_data.title}</h3>
                      <p className="text-sm text-gray-600">{taxonomy_data.description}</p>
                      <p className="text-sm font-semibold mt-2">
                        Category: {taxonomy_data.category}
                      </p>
                      <div className="mt-2">
                        <h4 className="font-semibold">Proficiency Description:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data.proficiencyDescription).map(
                            ([key, value]) => (
                              <li key={key}>
                                <strong>{key}:</strong> {value}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-semibold">Abilities:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data.abilities).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-semibold">Knowledge:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data.knowledge).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {value}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {taxonomy_data.rangeOfApplication && (
                        <div className="mt-2">
                          <h4 className="font-semibold">Range of Application:</h4>
                          <ul className="pl-4 list-disc">
                            {taxonomy_data.rangeOfApplication.map((application, index) => (
                              <li key={index}>{application}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  </>
                ) : (
                  <li>Loading...</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
