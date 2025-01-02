import OverviewCardLoading from '@/components/Dashboard/components/Skeletons/OverviewCardLoading';
import StaffSkillsOverviewLoading from '@/components/Dashboard/components/Skeletons/StaffSkillsOverviewLoading';
import TabListLoading from '@/components/Dashboard/components/Skeletons/TabListLoading';

export default function StaffLoading() {
  return (
    <div className="container mx-auto p-4 w-full md:max-w-[80%] select-none">
      <div>
        <TabListLoading tab_count={3} />
        <div className="mt-2 space-y-4">
          <div className="space-y-4">
            <OverviewCardLoading />
            <StaffSkillsOverviewLoading />
          </div>
        </div>
      </div>
    </div>
  );
}
