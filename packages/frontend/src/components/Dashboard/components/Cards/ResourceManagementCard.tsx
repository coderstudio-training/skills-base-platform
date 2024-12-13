'use client';

import { useResourceManagement } from '@/components/Dashboard/hooks/useResourceManagement';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function ResourceManagement() {
  const { loading, categoryStats } = useResourceManagement();

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
              ) : !categoryStats.length ? (
                <div className="text-center py-4">No resources found</div>
              ) : (
                categoryStats.map(({ name, totalResources, activeCourses }) => (
                  <div key={name} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{name}</h4>
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
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
