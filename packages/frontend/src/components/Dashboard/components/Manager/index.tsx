'use client';

import ManagerEvaluationLoading from '@/components/Dashboard/components/Skeletons/ManagerEvaluationLoading';
import ManagerOverviewLoadingCard from '@/components/Dashboard/components/Skeletons/ManagerOverviewLoading';
import ManagerTrainingLoading from '@/components/Dashboard/components/Skeletons/TabLoadingCard';
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

        <Suspense fallback={<ManagerOverviewLoadingCard />}>
          <TabsContent value="overview" className="space-y-4">
            <ManagerOverview teamMembers={teamMembers} />
          </TabsContent>
        </Suspense>

        {hasPermission('canViewReports') && (
          <Suspense
            fallback={
              <ManagerTrainingLoading
                title="Individual Performance"
                description="Average team performance over the last 6 months"
                loading_message="Loading Individual Performance"
              />
            }
          >
            <TabsContent value="performance">
              <IndividualPerformanceCard members={teamMembers} />
            </TabsContent>
          </Suspense>
        )}

        {hasPermission('canViewSkills') && (
          <Suspense
            fallback={
              <ManagerTrainingLoading
                title="Team Skills Breakdown"
                description="Detailed view of individual skills"
                loading_message="Loading Team Skills Breakdown"
              />
            }
          >
            <TabsContent value="skills">
              <SkillsView name={managerName || ''} />
            </TabsContent>
          </Suspense>
        )}

        {hasPermission('canViewLearning') && (
          <Suspense
            fallback={
              <ManagerTrainingLoading
                title="Training Recommendations"
                description="Personalized course recommendations based on skill gaps"
                loading_message="Loading Training Recommendations"
              />
            }
          >
            <TabsContent value="training">
              <Training name={managerName || ''} />
            </TabsContent>
          </Suspense>
        )}

        {hasPermission('canEditTeamSkills') && (
          <Suspense fallback={<ManagerEvaluationLoading />}>
            <TabsContent value="evaluation">
              <ManagerEvaluation teamMembers={teamMembers} />
            </TabsContent>
          </Suspense>
        )}
      </Tabs>
    </div>
  );
}
