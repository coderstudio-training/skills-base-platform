'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import StaffSkillsView from '@/components/dashboard/staff/StaffSkillsView';
// import { ScrollArea } from "@/components/ui/scroll-area";
import Overview from '@/components/dashboard/staff/Overview';
import StaffLearningRecommendations from '@/components/dashboard/staff/StaffLearningRecommendation';
import StaffDashboardHeader from '@/components/shared/StaffDashboardHeader';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

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
          <Overview />
        </TabsContent>

        {/* Skills Tab */}

        <TabsContent value="skills">
          <StaffSkillsView />
        </TabsContent>

        {/* Growth Tab */}

        <TabsContent value="growth-plan">
          <StaffLearningRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
