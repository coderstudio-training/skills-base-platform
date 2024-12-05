// src/app/dashboard/admin/components/LearningManagement.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CareerProgressionPaths } from './CareerProgressionPaths';
import { LearningResources } from './LearningResources';
import { PathProgressTracking } from './PathProgressTracking';
import { ResourceManagement } from './ResourceManagement';

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
