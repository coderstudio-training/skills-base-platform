'use client';

import OverviewCardLoading from '@/components/Dashboard/components/Skeletons/OverviewCardLoading';
import StaffSkillsOverviewLoading from '@/components/Dashboard/components/Skeletons/StaffSkillsOverviewLoading';
import StaffSkillsViewLoading from '@/components/Dashboard/components/Skeletons/StaffSkillsViewLoading';
import TabLoadingCard from '@/components/Dashboard/components/Skeletons/TabLoadingCard';
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
          <Suspense
            fallback={
              <div className="mt-2 space-y-4">
                <div className="space-y-4">
                  <OverviewCardLoading />
                  <StaffSkillsOverviewLoading />
                </div>
              </div>
            }
          >
            <TabsContent value="overview">
              <Overview
                skillsData={skillsData}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </TabsContent>
          </Suspense>
        )}

        {hasPermission('canViewSkills') && (
          <Suspense fallback={<StaffSkillsViewLoading />}>
            <TabsContent value="skills">
              <SkillsView
                skillsData={skillsData}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </TabsContent>
          </Suspense>
        )}

        {hasPermission('canViewLearning') && (
          <Suspense
            fallback={
              <TabLoadingCard
                title="Growth Plan"
                description="Skill gaps and recommended training courses"
                height="[600px]"
                loading_message="Loading Growth Plan"
              />
            }
          >
            <TabsContent value="growth-plan">
              <GrowthPlan email={email} />
            </TabsContent>
          </Suspense>
        )}
      </Tabs>
    </div>
  );
}
