import {
  BusinessUnitsResponse,
  EmployeeStats,
  EmployeesResponse,
  SkillGapsResponse,
  TopPerformersResponse,
} from '@/components/Dashboard/types';
import { skillsApi, userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useCallback, useEffect, useState } from 'react';

export function useAdminData() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Business Units');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, selectedBusinessUnit]);

  // Employees data query
  const endpoint =
    debouncedSearchQuery || selectedBusinessUnit !== 'All Business Units'
      ? '/employees/search'
      : '/employees';

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(debouncedSearchQuery && { searchTerm: debouncedSearchQuery }),
    ...(selectedBusinessUnit !== 'All Business Units' && {
      businessUnit: selectedBusinessUnit,
    }),
  }).toString();

  const {
    data: employeesData,
    error: employeesError,
    isLoading: employeesLoading,
  } = useQuery<EmployeesResponse>(userApi, `${endpoint}?${queryParams}`, {
    revalidate: 3600,
  });

  // Business units query
  const {
    data: businessUnitsData,
    error: businessUnitsError,
    isLoading: businessUnitsLoading,
  } = useQuery<BusinessUnitsResponse>(userApi, '/employees/business-units', {
    revalidate: 3600,
  });

  // Stats query
  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useQuery<EmployeeStats>(userApi, '/employees/stats', {
    revalidate: 3600,
  });

  // Skill gaps query
  const {
    data: skillGapsData,
    error: skillGapsError,
    isLoading: skillGapsLoading,
  } = useQuery<SkillGapsResponse>(skillsApi, '/skills-matrix/admin/analysis', {
    revalidate: 3600,
    requiresAuth: true,
  });

  // Top performers query
  const {
    data: topPerformersData,
    error: topPerformersError,
    isLoading: topPerformersLoading,
  } = useQuery<TopPerformersResponse>(skillsApi, '/skills-matrix/rankings', {
    revalidate: 3600,
  });

  // Handlers
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleLimitChange = useCallback(
    (newLimit: string) => {
      if (newLimit === 'all') {
        setLimit(employeesData?.total || 10);
      } else {
        setLimit(Number(newLimit));
      }
      setPage(1);
    },
    [employeesData?.total],
  );

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleBusinessUnitChange = useCallback((unit: string) => {
    setSelectedBusinessUnit(unit);
  }, []);

  return {
    // Employees data
    employees: employeesData?.items || [],
    totalItems: employeesData?.total || 0,
    totalPages: employeesData?.totalPages || 0,
    employeesLoading,
    employeesError,

    // Business units data
    businessUnits: businessUnitsData?.distribution || [],
    businessUnitsLoading,
    businessUnitsError,

    // Stats data
    stats: statsData || {
      totalEmployeesCount: 0,
      businessUnitsCount: 0,
      activeEmployeesCount: 0,
    },
    statsLoading,
    statsError,

    // Skill gaps data
    skillGaps: skillGapsData?.capabilities.flatMap(cap => cap.skillGaps) || [],
    skillGapsLoading,
    skillGapsError,

    // Top performers data
    topPerformers: topPerformersData?.rankings.slice(0, 10) || [],
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
  };
}
