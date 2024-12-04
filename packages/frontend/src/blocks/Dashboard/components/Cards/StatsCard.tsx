'use client';

import { useStatsData } from '@/blocks/Dashboard/hooks/useStatData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function StatsCards() {
  const { stats, loading, error } = useStatsData();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="col-span-3">
        <CardContent className="flex items-center justify-center p-6 text-red-500">
          Error loading statistics.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold leading-none tracking-tight">
            Total Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.totalEmployeesCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-semibold leading-none tracking-tight">Departments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.businessUnitsCount}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-semibold leading-none tracking-tight">
            Active Employees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.activeEmployeesCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}
