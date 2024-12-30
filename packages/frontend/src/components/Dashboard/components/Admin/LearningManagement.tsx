// src/app/dashboard/admin/components/LearningManagement.tsx

import BaseCard from '../Cards/BaseCard';
import { CareerProgressionPaths } from '../Cards/CareerProgressionCard';
import { LearningResources } from '../Cards/LearningResourcesCard';
import { PathProgressTracking } from '../Cards/PathProgressCard';
import { ResourceManagement } from '../Cards/ResourceManagementCard';

export default function LearningManagement() {
  return (
    <BaseCard title="Learning Management" description="Manage career paths and learning resources">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CareerProgressionPaths />
        <LearningResources />
        <PathProgressTracking />
        <ResourceManagement />
      </div>
    </BaseCard>
  );
}
