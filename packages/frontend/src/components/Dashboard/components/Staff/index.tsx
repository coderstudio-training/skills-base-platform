// components/Staff/StaffDashboard.tsx
'use client';

import { UserHeader } from '@/components/Dashboard/components/Header/UserHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/api/hooks';
import { useState } from 'react';
import { useStaffData } from '../../hooks/useStaffData';
import { DashboardProps } from '../../types';
import GrowthPlan from './GrowthPlan';
import Overview from './Overview';
import SkillsView from './SkillsView';

export default function StaffDashboard(user: DashboardProps) {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const email = user.email;
  const { skillsData, selectedCategory, setSelectedCategory } = useStaffData(email);

  return (
    <div className="container mx-auto p-4 max-w-max md:max-w-[80%]">
      <UserHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Details</TabsTrigger>
          <TabsTrigger value="growth-plan">Growth Plan</TabsTrigger>
        </TabsList>

        {hasPermission('canViewDashboard') && (
          <TabsContent value="overview">
            <Overview
              skillsData={skillsData}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </TabsContent>
        )}

        {hasPermission('canViewSkills') && (
          <TabsContent value="skills">
            <SkillsView
              skillsData={skillsData}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </TabsContent>
        )}

        {hasPermission('canViewLearning') && (
          <TabsContent value="growth-plan">
            <GrowthPlan email={email} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
