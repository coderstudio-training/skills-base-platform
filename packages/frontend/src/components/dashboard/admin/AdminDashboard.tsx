'use client';

import ErrorCard from '@/components/error/ErrorCard';
import AdminDashboardHeader from '@/components/shared/AdminDashboardHeader';
import TSCManager from '@/components/TSC/TSCManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQueryTechnicalTaxonomy } from '@/lib/skills/api';
import { Employee } from '@/types/admin';
import { Award, BarChart2, BookOpen, Loader2, Network, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import AnalysisView from './AnalysisView';
import BusinessUnitDistribution from './BusinessUnitDistribution';
import { LearningManagement } from './learning/LearningManagement';
import SearchAndFilter from './SearchAndFilter';
import SkillGapOverview from './SkillGapOverview';
import StatsCards from './StatsCards';
import TopPerformers from './TopPerformers';
import EmployeeDirectory from './UserDirectory';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Business Units');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [businessUnitsLoading, setBusinessUnitsLoading] = useState(true);
  const { data: QA_Tsc, isLoading, error: queryError, refetch } = useQueryTechnicalTaxonomy('QA');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchBusinessUnits = async () => {
      setBusinessUnitsLoading(true);
      try {
        const response = await fetch('/api/employees/business-units');
        if (!response.ok) {
          throw new Error('Failed to fetch business units');
        }
        const data = await response.json();
        console.log('Business units call: ', data, ' | Business units:', businessUnits);
        setBusinessUnits(['All Business Units', ...data.businessUnits]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch business units');
      } finally {
        setBusinessUnitsLoading(false);
      }
    };

    fetchBusinessUnits();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(debouncedSearchQuery && { searchTerm: debouncedSearchQuery }),
          ...(selectedBusinessUnit !== 'All Business Units' && {
            businessUnit: selectedBusinessUnit,
          }),
        });

        const endpoint =
          debouncedSearchQuery || selectedBusinessUnit !== 'All Business Units'
            ? '/api/employees/search'
            : '/api/employees';

        const response = await fetch(`${endpoint}?${searchParams}`);

        if (!response.ok) {
          throw new Error('Failed to fetch employees');
        }

        const data = await response.json();
        setEmployees(data.items);
        setTotalItems(data.total);
        setTotalPages(data.totalPages);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : `An error occurred ${error}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [debouncedSearchQuery, page, limit, selectedBusinessUnit]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleBusinessUnitChange = (unit: string) => {
    setSelectedBusinessUnit(unit);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: string) => {
    if (newLimit === 'all') {
      setLimit(totalItems);
    } else {
      setLimit(Number(newLimit));
    }
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminDashboardHeader />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filter */}
        <SearchAndFilter
          selectedBusinessUnit={selectedBusinessUnit}
          businessUnits={businessUnits}
          searchQuery={searchQuery}
          onBusinessUnitChange={handleBusinessUnitChange}
          onSearchChange={handleSearch}
          isLoading={loading || businessUnitsLoading}
        />

        {/* Stats Cards */}
        <StatsCards />

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Top Performers */}
          <TopPerformers />

          {/* Skill Gap Overview */}
          <SkillGapOverview />

          {/* Department Distribution */}
          <BusinessUnitDistribution />
        </div>

        {/* Tabs Structure */}
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
            <TabsTrigger value="taxonomy" className="flex iutems-center gap-2">
              <BookOpen className="h-4 w-4" />
              Taxonomy
            </TabsTrigger>
          </TabsList>

          {/* Users Directory */}
          <TabsContent value="users">
            <TabsContent value="users">
              <EmployeeDirectory
                employees={employees}
                loading={loading}
                totalItems={totalItems}
                totalPages={totalPages}
                page={page}
                limit={limit}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            </TabsContent>
          </TabsContent>

          {/* Metrics */}
          <TabsContent value="metrics">
            <AnalysisView />
          </TabsContent>
          <TabsContent value="taxonomy">
            {queryError ? (
              <ErrorCard
                cardTitle="TSC Manager"
                status={queryError.status}
                message={queryError.message}
                error_code={queryError.code}
                refetch={refetch}
              />
            ) : !isLoading && QA_Tsc ? (
              <TSCManager selectedBusinessUnit={selectedBusinessUnit} data={QA_Tsc} />
            ) : (
              <div className="h-[350px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading taxonomy...</p>
                </div>
              </div>
            )}
          </TabsContent>
          {/* Learning */}
          <TabsContent value="learning">
            <LearningManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
