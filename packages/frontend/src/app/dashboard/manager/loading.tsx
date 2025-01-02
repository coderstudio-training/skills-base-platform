import ManagerOverviewLoadingCard from '@/components/Dashboard/components/Skeletons/ManagerOverviewLoading';
import TabListLoading from '@/components/Dashboard/components/Skeletons/TabListLoading';

export default function ManagerLoading() {
  return (
    <div className="container mx-auto p-4 max-w-[80%] select-none">
      <div>
        <TabListLoading tab_count={5} />
        <ManagerOverviewLoadingCard />
      </div>
    </div>
  );
}
