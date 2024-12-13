// components/Staff/StaffDashboard.tsx
'use client';

import { UserHeader } from '@/components/Dashboard/components/Header/UserHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStaffData } from '../../hooks/useStaffData';
import GrowthPlan from './GrowthPlan';
import Overview from './Overview';
import SkillsView from './SkillsView';

export default function StaffDashboard() {
  const {
    skillsData,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
  } = useStaffData();

  return (
    <div className="container mx-auto p-4 max-w-[80%]">
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
            loading={loading}
            error={error}
          />
        </TabsContent>

        <TabsContent value="skills">
          <SkillsView
            skillsData={skillsData}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            loading={loading}
            error={error}
          />
        </TabsContent>
        <TabsContent value="growth-plan">
          <GrowthPlan />
        </TabsContent>
      </Tabs>
    </div>
  );
}
