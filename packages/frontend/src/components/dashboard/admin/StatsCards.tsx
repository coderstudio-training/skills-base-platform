// StatsCards.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface EmployeeStats {
  totalEmployeesCount: number;
  businessUnitsCount: number;
  activeEmployeesCount: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<EmployeeStats>({
    totalEmployeesCount: 0,
    businessUnitsCount: 0,
    activeEmployeesCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        const response = await fetch('/api/employees/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch employee statistics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        console.error('Error fetching employee statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeStats();
  }, []);

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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="col-span-3">
          <CardContent className="flex items-center justify-center p-6 text-red-500">
            Error loading statistics: {error}
          </CardContent>
        </Card>
      </div>
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
