'use client';

import { LearningManagement } from '@/components/Dashboard/components/Admin/LearningManagement';
import { SearchAndFilter } from '@/components/Dashboard/components/Admin/SearchAndFilter';
import { UserDirectory } from '@/components/Dashboard/components/Admin/UserDirectory';
import { AdminMetricCards } from '@/components/Dashboard/components/Cards/AdminMetricCards';
import { BusinessUnitDistribution } from '@/components/Dashboard/components/Cards/BusinessUnitDistributionCard';
import { SkillGapOverview } from '@/components/Dashboard/components/Cards/SkillGapOverviewCard';
import { TopPerformers } from '@/components/Dashboard/components/Cards/TopPerformersCard';
import { useAdminData } from '@/components/Dashboard/hooks/useAdminData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BarChart2, BookOpen, Network, Users } from 'lucide-react';
import { useTSCManager } from '../../hooks/useTSCManager';
import AdminDashboardHeader from '../Header/AdminHeader';
import TaxonomyManager from '../TSC';
import AnalysisView from './AnalysisView';

export default function AdminDashboard() {
  const {
    // Employee data
    employees,
    totalItems,
    totalPages,
    employeesLoading,
    // Business units data
    businessUnits,

    // Stats data
    stats,

    // Skill gaps data
    skillGaps,

    // Top performers data
    topPerformers,

    // Pagination and filter state
    page,
    limit,
    searchQuery,
    selectedBusinessUnit,

    // Handlers
    handlePageChange,
    handleLimitChange,
    handleSearch,
    handleBusinessUnitChange,
  } = useAdminData();

  const { data: tscData } = useTSCManager();

  return (
    <div className="md:min-h-screen bg-gray-50 dark:bg-gray-950">
      <AdminDashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <SearchAndFilter
          selectedBusinessUnit={selectedBusinessUnit}
          businessUnits={businessUnits.map(bu => bu.name)}
          searchQuery={searchQuery}
          onBusinessUnitChange={handleBusinessUnitChange}
          onSearchChange={handleSearch}
        />

        <AdminMetricCards stats={stats} />

        <div className="grid md:grid-cols-3 gap-4 mb-6 ">
          <TopPerformers rankings={topPerformers} />
          <SkillGapOverview skillGaps={skillGaps} />
          <BusinessUnitDistribution businessUnits={businessUnits} />
        </div>

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
                <BookOpen className="h-4 w-4" />
                Learning
              </TabsTrigger>
              <TabsTrigger value="taxonomy" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Taxonomy
              </TabsTrigger>
            </TabsList>
          </div>

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

          {/* Metrics */}
          <TabsContent value="metrics">
            <AnalysisView />
          </TabsContent>

          {/* Learning */}
          <TabsContent value="learning">
            <LearningManagement />
          </TabsContent>

          <TabsContent value="taxonomy">
            <TaxonomyManager
              searchQuery={searchQuery}
              data={tscData ? tscData : []}
              selectedBusinessUnit={selectedBusinessUnit}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
