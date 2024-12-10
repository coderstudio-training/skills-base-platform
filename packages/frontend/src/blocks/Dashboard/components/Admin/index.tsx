'use client';

import { LearningManagement } from '@/blocks/Dashboard/components/Admin/LearningManagement';
import AdminDashboardHeader from '@/blocks/Dashboard/components/Header/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, BarChart2, BookOpen, Network, Users } from 'lucide-react';
import { useAdminData } from '../../hooks/useAdminData';
import { useTSCManager } from '../../hooks/useTSCManager';
import { AdminMetricCards } from '../Cards/AdminMetricCards';
import { BusinessUnitDistribution } from '../Cards/BusinessUnitDistributionCard';
import { SkillGapOverview } from '../Cards/SkillGapOverviewCard';
import { TopPerformers } from '../Cards/TopPerformersCard';
import TaxonomyManager from '../TSC';
import AnalysisView from './AnalysisView';
import { SearchAndFilter } from './SearchAndFilter';
import { UserDirectory } from './UserDirectory';

export default function AdminDashboard() {
  const {
    // Employee data
    employees,
    totalItems,
    totalPages,
    employeesLoading,

    // Business units data
    businessUnits,
    businessUnitsLoading,
    businessUnitsError,

    // Stats data
    stats,
    statsLoading,
    statsError,

    // Skill gaps data
    skillGaps,
    skillGapsLoading,
    skillGapsError,

    // Top performers data
    topPerformers,
    topPerformersLoading,
    topPerformersError,

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

        <AdminMetricCards stats={stats} loading={statsLoading} error={statsError} />

        <div className="grid grid-cols-3 gap-4 mb-6">
          <TopPerformers
            rankings={topPerformers}
            loading={topPerformersLoading}
            error={topPerformersError}
          />
          <SkillGapOverview
            skillGaps={skillGaps}
            loading={skillGapsLoading}
            error={skillGapsError}
          />
          <BusinessUnitDistribution
            businessUnits={businessUnits}
            loading={businessUnitsLoading}
            error={businessUnitsError}
          />
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
