'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { dummyStaffData } from '@/lib/dummyData';
import { StaffData } from '@/types/staff';
import StaffSkillsView from './StaffSkillsView';
// import { ScrollArea } from "@/components/ui/scroll-area";
import StaffDashboardHeader from '@/components/shared/StaffDashboardHeader';
import Overview from './Overview';

export default function StaffDashboard() {
  //const { data: session } = useSession();
  const [staffData] = useState<StaffData>(dummyStaffData);

  return (
    <div className="container mx-auto p-4">
      <StaffDashboardHeader />

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Details</TabsTrigger>
          <TabsTrigger value="career">Learning Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview />
        </TabsContent>
        <TabsContent value="skills">
          <StaffSkillsView />
        </TabsContent>

        <TabsContent value="career">
          <Card>
            <CardHeader>
              <CardTitle>Learning Recommendations</CardTitle>
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
