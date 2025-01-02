import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { CareerProgressionPaths } from '@/components/Dashboard/components/Cards/CareerProgressionCard';
import { LearningResources } from '@/components/Dashboard/components/Cards/LearningResourcesCard';
import { PathProgressTracking } from '@/components/Dashboard/components/Cards/PathProgressCard';
import { ResourceManagement } from '@/components/Dashboard/components/Cards/ResourceManagementCard';

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
