'use client';

import { useBusinessUnits } from '@/components/dashboard/hooks/useBusinessUnits';
import AdminDashboardHeader from '@/components/shared/AdminDashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BarChart2, BookOpen, Network, Users } from 'lucide-react';
import { useAdminData } from '../../hooks/useAdminData';
import { BusinessUnitDistribution } from '../cards/BusinessUnitDistributionCard';
import { SkillGapOverview } from '../cards/SkillGapOverviewCard';
import { StatsCards } from '../cards/StatsCard';
import { TopPerformers } from '../cards/TopPerformersCard';
import { LearningManagement } from './learning/LearningManagement';
import { SearchAndFilter } from './SearchAndFilter';
import { UserDirectory } from './UserDirectory';

export function AdminDashboard() {
  const { distribution: businessUnits, loading: businessUnitsLoading } = useBusinessUnits();
  const {
    employees,
    loading: employeesLoading,
    page,
    limit,
    totalItems,
    totalPages,
    selectedBusinessUnit,
    searchQuery,
    handlePageChange,
    handleLimitChange,
    handleSearch,
    handleBusinessUnitChange,
  } = useAdminData();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <SearchAndFilter
          selectedBusinessUnit={selectedBusinessUnit}
          businessUnits={businessUnits.map(bu => bu.name)}
          searchQuery={searchQuery}
          onBusinessUnitChange={handleBusinessUnitChange}
          onSearchChange={handleSearch}
          isLoading={employeesLoading || businessUnitsLoading}
        />

        <StatsCards />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <TopPerformers />
          <SkillGapOverview />
          <BusinessUnitDistribution />
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
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
              <BookOpen className="h-4 w-4" />
              Learning
            </TabsTrigger>
            <TabsTrigger value="taxonomy" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Taxonomy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserDirectory
              employees={employees}
              loading={employeesLoading}
              totalItems={totalItems}
              totalPages={totalPages}
              page={page}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            />
          </TabsContent>

          <TabsContent value="metrics">{/* <AnalysisView /> */}</TabsContent>

          <TabsContent value="learning">
            <LearningManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
