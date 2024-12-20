'use client';

import { SearchAndFilter } from '@/components/Dashboard/components/Admin/SearchAndFilter';
import { UserDirectory } from '@/components/Dashboard/components/Admin/UserDirectory';
import { AdminMetricCards } from '@/components/Dashboard/components/Cards/AdminMetricCards';
import { BusinessUnitDistribution } from '@/components/Dashboard/components/Cards/BusinessUnitDistributionCard';
import { SkillGapOverview } from '@/components/Dashboard/components/Cards/SkillGapOverviewCard';
import { TopPerformers } from '@/components/Dashboard/components/Cards/TopPerformersCard';
import AdminDashboardHeader from '@/components/Dashboard/components/Header/AdminHeader';
import { useAdminData } from '@/components/Dashboard/hooks/useAdminData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/api/hooks';
import { Award, BarChart2, BookOpen, Network, Users } from 'lucide-react';
import { useTSCManager } from '../../hooks/useTSCManager';
import TaxonomyManager from '../TSC';
import AnalysisView from './AnalysisView';
import { LearningManagement } from './LearningManagement';

export default function AdminDashboard() {
  const { role, hasPermission } = useAuth();
  const isAdmin = role?.includes('admin');

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

  const { data: tscData } = useTSCManager();

  if (isAdmin && !hasPermission('canManageSystem')) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Access Denied</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader />

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

            <AdminMetricCards stats={stats} />

            <div className="grid grid-cols-3 gap-4 mb-6">
              <TopPerformers rankings={topPerformers} />
              <SkillGapOverview skillGaps={skillGaps} />
              <BusinessUnitDistribution businessUnits={businessUnits} />
            </div>
          </>
        )}

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

          {hasPermission('canManageUsers') && (
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
          )}

          {hasPermission('canViewReports') && (
            <TabsContent value="metrics">
              <AnalysisView />
            </TabsContent>
          )}

          {hasPermission('canEditAllLearning') && (
            <TabsContent value="learning">
              <LearningManagement />
            </TabsContent>
          )}

          {hasPermission('canManageSystem') && (
            <TabsContent value="taxonomy">
              <TaxonomyManager
                searchQuery={searchQuery}
                data={tscData ? tscData : []}
                selectedBusinessUnit={selectedBusinessUnit}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
