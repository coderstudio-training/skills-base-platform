'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { ScrollArea } from "@/components/ui/scroll-area";
import StaffLearningRecommendations from '@/components/dashboard/staff/StaffLearningRecommendation';
import StaffDashboardHeader from '@/components/shared/StaffDashboardHeader';
import { dummyStaffData } from '@/lib/dummyData';
import { StaffData } from '@/types/staff';
import { Award, BookOpen, Scroll, TrendingUp } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

export default function StaffDashboard() {
  //const { data: session } = useSession();
  const [staffData] = useState<StaffData>(dummyStaffData);

  return (
    <div className="container mx-auto p-4">
      <StaffDashboardHeader />

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">My Skills</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="learning">Learning Paths</TabsTrigger>
          <TabsTrigger value="network">My Network</TabsTrigger>
          <TabsTrigger value="growth-plan">Growth Plan</TabsTrigger>
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
        <TabsContent value="growth-plan">
          <StaffLearningRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
