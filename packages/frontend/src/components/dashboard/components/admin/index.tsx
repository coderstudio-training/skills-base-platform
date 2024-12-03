'use client';

import { useAdminDashboard } from '@/components/dashboard/components/hooks/useAdminDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, BookOpen, Users } from 'lucide-react';
// import { AdminHeader } from './AdminHeader';
// import { AnalysisView } from './AnalysisView';
// import { BusinessUnitDistribution } from './BusinessUnitDistribution';
// import { SearchAndFilter } from './SearchAndFilter';
// import { SkillGapOverview } from './SkillGapOverview';
import { StatsCards } from './StatsCards';
// import { TopPerformers } from './TopPerformers';
// import { EmployeeDirectory } from './UserDirectory';
import AdminDashboardHeader from '@/components/shared/AdminDashboardHeader';
import { LearningManagement } from './learning/LearningManagement';

export function AdminDashboard() {
  // const [searchQuery, setSearchQuery] = useState('');
  // const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Business Units');
  useAdminDashboard();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboardHeader />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* <SearchAndFilter
          selectedBusinessUnit={selectedBusinessUnit}
          businessUnits={businessUnits}
          searchQuery={searchQuery}
          onBusinessUnitChange={handleBusinessUnitChange}
          onSearchChange={handleSearch}
          isLoading={loading}
        /> */}

        <StatsCards />

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* <TopPerformers />
          <SkillGapOverview />
          <BusinessUnitDistribution /> */}
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
            <TabsTrigger value="metrics" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            {/* <EmployeeDirectory
              employees={employees}
              loading={loading}
              totalItems={totalItems}
              totalPages={totalPages}
              page={page}
              limit={limit}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
            /> */}
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
