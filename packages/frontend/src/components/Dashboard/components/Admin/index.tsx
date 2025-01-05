'use client';

import { SearchAndFilter } from '@/components/Dashboard/components/Admin/SearchAndFilter';
import { BusinessUnitDistribution } from '@/components/Dashboard/components/Cards/BusinessUnitDistributionCard';
import { SkillGapOverview } from '@/components/Dashboard/components/Cards/SkillGapOverviewCard';
import { TopPerformers } from '@/components/Dashboard/components/Cards/TopPerformersCard';
import AdminAnalysisLoading from '@/components/Dashboard/components/Skeletons/AdminAnalysisLoading';
import AdminLearningLoading from '@/components/Dashboard/components/Skeletons/AdminLearningLoading';
import AdminMetricCardLoading from '@/components/Dashboard/components/Skeletons/AdminMetricCardLoading';
import DistributionLoading from '@/components/Dashboard/components/Skeletons/DistributionLoading';
import RankingLoadingCard from '@/components/Dashboard/components/Skeletons/RankingLoadingCard';
import SkillGapLoadingCard from '@/components/Dashboard/components/Skeletons/SkillGapLoadingCard';
import StatsLoadingCard from '@/components/Dashboard/components/Skeletons/StatsLoadingCard';
import TaxonomyManagerLoading from '@/components/Dashboard/components/Skeletons/TSCManagerLoading';
import { useAdminData } from '@/components/Dashboard/hooks/useAdminData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/api/hooks';
import { Award, BarChart2, BookOpen, GraduationCap, Network, Users } from 'lucide-react';
import { Suspense, lazy } from 'react';

const UserDirectory = lazy(() => import('@/components/Dashboard/components/Admin/UserDirectory'));
const AnalysisView = lazy(() => import('@/components/Dashboard/components/Admin/AnalysisView'));
const LearningManagement = lazy(
  () => import('@/components/Dashboard/components/Admin/LearningManagement'),
);
const TaxonomyManager = lazy(() => import('@/components/Dashboard/components/Taxonomy/index'));
const AdminMetricCards = lazy(
  () => import('@/components/Dashboard/components/Cards/AdminMetricCards'),
);

export default function AdminDashboard() {
  const { hasPermission } = useAuth();
  const {
    employees,
    totalItems,
    totalPages,
    employeesLoading,
    businessUnits,
    stats,
    skillGaps,
    topPerformers,
    page,
    limit,
    searchQuery,
    selectedBusinessUnit,
    handlePageChange,
    handleLimitChange,
    handleSearch,
    handleBusinessUnitChange,
  } = useAdminData();

  return (
    <div className="md:min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="max-w-7xl mx-auto px-4 py-8">
        {hasPermission('canManageUsers') && (
          <>
            <SearchAndFilter
              selectedBusinessUnit={selectedBusinessUnit}
              businessUnits={businessUnits.map(bu => bu.name)}
              searchQuery={searchQuery}
              onBusinessUnitChange={handleBusinessUnitChange}
              onSearchChange={handleSearch}
              isLoading={employeesLoading}
            />

            <Suspense fallback={<AdminMetricCardLoading />}>
              <AdminMetricCards stats={stats} />
            </Suspense>

            <Suspense fallback={<StatsLoadingCard />}>
              <div className="grid lg:grid-cols-3 gap-4 mb-6">
                <Suspense fallback={<RankingLoadingCard />}>
                  <TopPerformers rankings={topPerformers} />
                </Suspense>
                <Suspense fallback={<SkillGapLoadingCard />}>
                  <SkillGapOverview skillGaps={skillGaps} />
                </Suspense>
                <Suspense fallback={<DistributionLoading />}>
                  <BusinessUnitDistribution businessUnits={businessUnits} />
                </Suspense>
              </div>
            </Suspense>
          </>
        )}

        <Tabs defaultValue="users" className="space-y-4">
          <div className="overflow-x-auto w-full scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
            <TabsList className="inline-flex max-w-max">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="required-skills" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Required Skills
              </TabsTrigger>
              <TabsTrigger value="organization" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Organization
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Metrics
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Learning
              </TabsTrigger>
            </TabsList>
          </div>

          {hasPermission('canManageUsers') && (
            <Suspense
              fallback={
                <UserDirectory
                  employees={[]}
                  loading={true}
                  totalItems={0}
                  totalPages={0}
                  page={0}
                  limit={0}
                  onPageChange={() => {}}
                  onLimitChange={() => {}}
                />
              }
            >
              <TabsContent value="users">
                <UserDirectory
                  employees={employees}
                  totalItems={totalItems}
                  totalPages={totalPages}
                  loading={employeesLoading}
                  page={page}
                  limit={limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              </TabsContent>
            </Suspense>
          )}

          {hasPermission('canViewReports') && (
            <Suspense fallback={<AdminAnalysisLoading />}>
              <TabsContent value="metrics">
                <AnalysisView />
              </TabsContent>
            </Suspense>
          )}

          {hasPermission('canEditAllLearning') && (
            <Suspense fallback={<AdminLearningLoading />}>
              <TabsContent value="learning">
                <LearningManagement />
              </TabsContent>
            </Suspense>
          )}

          {hasPermission('canManageSystem') && (
            <Suspense fallback={<TaxonomyManagerLoading />}>
              <TabsContent value="skills">
                <TaxonomyManager
                  searchQuery={searchQuery}
                  selectedBusinessUnit={selectedBusinessUnit}
                />
              </TabsContent>
            </Suspense>
          )}
        </Tabs>
      </main>
    </div>
  );
}
