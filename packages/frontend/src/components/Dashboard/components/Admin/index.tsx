'use client';

import { LearningManagement } from '@/components/Dashboard/components/Admin/LearningManagement';
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
import { Award, BarChart2, BookOpen, Network, Users } from 'lucide-react';
import { usePermissions } from '../../hooks/usePermissions';
import { useTSCManager } from '../../hooks/useTSCManager';
import { PermissionGate } from '../PermissionGate';
import TaxonomyManager from '../TSC';
import AnalysisView from './AnalysisView';

export default function AdminDashboard() {
  const { hasPermission } = usePermissions();
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

  if (!hasPermission('canManageSystem')) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <p>You dont have permission to access the admin dashboard.</p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <PermissionGate permission="canManageUsers">
          <SearchAndFilter
            selectedBusinessUnit={selectedBusinessUnit}
            businessUnits={businessUnits.map(bu => bu.name)}
            searchQuery={searchQuery}
            onBusinessUnitChange={handleBusinessUnitChange}
            onSearchChange={handleSearch}
            isLoading={employeesLoading}
          />

          <AdminMetricCards stats={stats} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <TopPerformers rankings={topPerformers} loading={employeesLoading} />
            <SkillGapOverview skillGaps={skillGaps} loading={employeesLoading} />
            <BusinessUnitDistribution businessUnits={businessUnits} loading={employeesLoading} />
          </div>
        </PermissionGate>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <PermissionGate permission="canManageUsers">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission="canEditAllSkills">
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Skills
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission="canEditAllSkills">
              <TabsTrigger value="required-skills" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Required Skills
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission="canManageSystem">
              <TabsTrigger value="organization" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                Organization
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission="canViewReports">
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4" />
                Metrics
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission="canEditAllLearning">
              <TabsTrigger value="learning" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Learning
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate permission="canManageSystem">
              <TabsTrigger value="taxonomy" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Taxonomy
              </TabsTrigger>
            </PermissionGate>
          </TabsList>

          <PermissionGate permission="canManageUsers">
            <TabsContent value="users" className="space-y-4">
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
          </PermissionGate>

          <PermissionGate permission="canViewReports">
            <TabsContent value="metrics">
              <AnalysisView />
            </TabsContent>
          </PermissionGate>

          <PermissionGate permission="canEditAllLearning">
            <TabsContent value="learning">
              <LearningManagement />
            </TabsContent>
          </PermissionGate>

          <PermissionGate permission="canManageSystem">
            <TabsContent value="taxonomy">
              <TaxonomyManager
                searchQuery={searchQuery}
                data={tscData || []}
                selectedBusinessUnit={selectedBusinessUnit}
              />
            </TabsContent>
          </PermissionGate>
        </Tabs>
      </main>
    </div>
  );
}
