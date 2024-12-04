import { EmployeesResponse } from '@/components/dashboard/types';
import { userApi } from '@/lib/api/client';
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
    error,
    isLoading,
  } = useQuery<EmployeesResponse>(userApi, `${endpoint}?${queryParams}`, {
    revalidate: 3600,
  });

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
    employees: employeesData?.items || [],
    totalItems: employeesData?.total || 0,
    totalPages: employeesData?.totalPages || 0,
    page,
    limit,
    searchQuery,
    selectedBusinessUnit,
    loading: isLoading,
    error,
    handlePageChange,
    handleLimitChange,
    handleSearch,
    handleBusinessUnitChange,
  };
}
