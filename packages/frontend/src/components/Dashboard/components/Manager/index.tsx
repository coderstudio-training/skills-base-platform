'use client';

import ManagerOverviewLoadingCard from '@/components/Dashboard/components/Skeletons/ManagerOverviewLoading';
import { useTeamData } from '@/components/Dashboard/hooks/useTeamData';
import { DashboardProps } from '@/components/Dashboard/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/api/hooks';
import { lazy, Suspense, useState } from 'react';

const ManagerOverview = lazy(
  () => import('@/components/Dashboard/components/Manager/ManagerOverview'),
);
const IndividualPerformanceCard = lazy(
  () => import('@/components/Dashboard/components/Cards/IndividualPerformanceCard'),
);
const SkillsView = lazy(() => import('@/components/Dashboard/components/Manager/SkillsView'));
const Training = lazy(() => import('@/components/Dashboard/components/Manager/Training'));
const ManagerEvaluation = lazy(
  () => import('@/components/Dashboard/components/Cards/ManagerEvaluation'),
);

export default function ManagerDashboard(user: DashboardProps) {
  const { hasPermission } = useAuth();
  const managerName = user.name;
  const [activeTab, setActiveTab] = useState('overview');
  const { teamMembers } = useTeamData(managerName);

  return (
    <div className="container mx-auto p-4 max-w-full lg:max-w-[80%]">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<ManagerOverviewLoadingCard />}>
            <ManagerOverview teamMembers={teamMembers} />
          </Suspense>
        </TabsContent>

        {hasPermission('canViewReports') && (
          <TabsContent value="performance">
            <Suspense fallback={<div>Loading...</div>}>
              <IndividualPerformanceCard members={teamMembers} />
            </Suspense>
          </TabsContent>
        )}

        {hasPermission('canViewSkills') && (
          <TabsContent value="skills">
            <Suspense fallback={<div>Loading...</div>}>
              <SkillsView name={managerName || ''} />
            </Suspense>
          </TabsContent>
        )}

        {hasPermission('canViewLearning') && (
          <TabsContent value="training">
            <Suspense fallback={<div>Loading...</div>}>
              <Training name={managerName || ''} />
            </Suspense>
          </TabsContent>
        )}

        {hasPermission('canEditTeamSkills') && (
          <TabsContent value="evaluation">
            <Suspense fallback={<div>Loading...</div>}>
              <ManagerEvaluation teamMembers={teamMembers} />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
