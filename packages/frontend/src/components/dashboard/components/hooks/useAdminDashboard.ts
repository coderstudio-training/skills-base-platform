'use client';

import { BusinessUnitsResponse, EmployeesResponse } from '@/components/dashboard/types';
import { userApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { useEffect, useState } from 'react';

export function useAdminDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('All Business Units');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const {
    data: employeesData,
    error,
    isLoading: loading,
  } = useQuery<EmployeesResponse>(
    userApi,
    `/employees?${new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(debouncedSearchQuery && { searchTerm: debouncedSearchQuery }),
      ...(selectedBusinessUnit !== 'All Business Units' && {
        businessUnit: selectedBusinessUnit,
      }),
    })}`,
    {
      revalidate: 3600,
      // tags: ['employees'],
    },
  );

  const { data: businessUnitsData } = useQuery<BusinessUnitsResponse>(
    userApi,
    '/employees/business-units',
    {
      revalidate: 3600,
      // tags: ['businessUnits'],
    },
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: string) => {
    if (newLimit === 'all') {
      setLimit(employeesData?.total || 10);
    } else {
      setLimit(Number(newLimit));
    }
    setPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleBusinessUnitChange = (unit: string) => {
    setSelectedBusinessUnit(unit);
    setPage(1);
  };

  return {
    employees: employeesData?.items || [],
    businessUnits: businessUnitsData?.businessUnits || [],
    loading,
    error,
    page,
    limit,
    totalItems: employeesData?.total || 0,
    totalPages: employeesData?.totalPages || 0,
    handlePageChange,
    handleLimitChange,
    handleSearch,
    handleBusinessUnitChange,
  };
}
