'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getResourceManagement } from '@/lib/api';
import { Course } from '@/types/admin';
import { useEffect, useState } from 'react';

interface ResourceStats {
  resources: Course[];
  totalCount: number;
}

export function ResourceManagement() {
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResourceStats() {
      try {
        setLoading(true);
        const data = await getResourceManagement();
        setResourceStats(data);
      } catch (error) {
        console.error('Error fetching resource stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchResourceStats();
  }, []);

  const categories = resourceStats?.resources
    ? Array.from(new Set(resourceStats.resources.map(r => r.skillCategory))).sort()
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              Add Resource
            </Button>
            <Button variant="outline" size="sm">
              Import
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : !resourceStats?.resources.length ? (
                <div className="text-center py-4">No resources found</div>
              ) : (
                categories.map(category => {
                  const totalResources =
                    resourceStats?.resources.filter(r => r.skillCategory === category).length || 0;

                  const activeCourses =
                    resourceStats?.resources.filter(
                      r =>
                        r.skillCategory === category &&
                        r.fields.some(f => f.name === 'status' && f.value === 'active'),
                    ).length || 0;

                  return (
                    <div key={category} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{category}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total Resources</span>
                          <Badge>{totalResources}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Active Courses</span>
                          <Badge variant="secondary">{activeCourses}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-2">
                          Manage Resources
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
