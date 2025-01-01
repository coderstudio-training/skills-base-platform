// components/Staff/StaffDashboard.tsx
'use client';

import { useStaffData } from '@/components/Dashboard/hooks/useStaffData';
import { DashboardProps } from '@/components/Dashboard/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/api/hooks';
import { lazy, Suspense, useState } from 'react';

const Overview = lazy(() => import('@/components/Dashboard/components/Staff/Overview'));
const SkillsView = lazy(() => import('@/components/Dashboard/components/Staff/SkillsView'));
const GrowthPlan = lazy(() => import('@/components/Dashboard/components/Staff/GrowthPlan'));

export default function StaffDashboard(user: DashboardProps) {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const email = user.email;
  const { skillsData, selectedCategory, setSelectedCategory } = useStaffData(email);

  return (
    <div className="container mx-auto p-4 max-w-max md:max-w-[80%]">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="skills">Skills Details</TabsTrigger>
          <TabsTrigger value="growth-plan">Growth Plan</TabsTrigger>
        </TabsList>

        {hasPermission('canViewDashboard') && (
          <TabsContent value="overview">
            <Suspense fallback={<div>Loading...</div>}>
              <Overview
                skillsData={skillsData}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </Suspense>
          </TabsContent>
        )}

        {hasPermission('canViewSkills') && (
          <TabsContent value="skills">
            <Suspense fallback={<div>Loading...</div>}>
              <SkillsView
                skillsData={skillsData}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </Suspense>
          </TabsContent>
        )}

        {hasPermission('canViewLearning') && (
          <TabsContent value="growth-plan">
            <Suspense fallback={<div>Loading...</div>}>
              <GrowthPlan email={email} />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
