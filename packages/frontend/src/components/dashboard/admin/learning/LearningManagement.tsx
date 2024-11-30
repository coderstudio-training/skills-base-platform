// src/app/dashboard/admin/components/LearningManagement.tsx
import { CareerProgressionPaths } from '@/components/dashboard/admin/learning/CareerProgressionPaths';
import { LearningResources } from '@/components/dashboard/admin/learning/LearningResources';
import { PathProgressTracking } from '@/components/dashboard/admin/learning/PathProgressTracking';
import { ResourceManagement } from '@/components/dashboard/admin/learning/ResourceManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LearningManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Management</CardTitle>
        <CardDescription>Manage career paths and learning resources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CareerProgressionPaths />
          <LearningResources />
          <PathProgressTracking />
          <ResourceManagement />
        </div>
      </CardContent>
    </Card>
  );
}
