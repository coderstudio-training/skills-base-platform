// components/Staff/StaffDashboard.tsx
'use client';

import { UserHeader } from '@/components/Dashboard/components/Header/UserHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStaffData } from '../../hooks/useStaffData';
import { DashboardProps } from '../../types';
import GrowthPlan from './GrowthPlan';
import Overview from './Overview';
import SkillsView from './SkillsView';

export default function StaffDashboard(user: DashboardProps) {
  const email = user.email;
  const { skillsData, activeTab, setActiveTab, selectedCategory, setSelectedCategory } =
    useStaffData(email);

  return (
    <div className="container mx-auto p-4 max-w-max md:max-w-[80%]">
      <UserHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Details</TabsTrigger>
          <TabsTrigger value="growth-plan">Growth Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview
            skillsData={skillsData}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsView
            skillsData={skillsData}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </TabsContent>
        <TabsContent value="growth-plan">
          <GrowthPlan email={email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
