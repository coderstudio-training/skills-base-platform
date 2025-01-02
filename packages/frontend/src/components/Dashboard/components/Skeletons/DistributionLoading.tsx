import LoadingCard from '@/components/Dashboard/components/Skeletons/LoadingCard';
import { Skeleton } from '@/components/ui/skeleton';

const BusinessUnitSkeletonItem = ({ text, value }: { text: string; value: string }) => (
  <div className="flex justify-between items-center">
    <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
      {text}
    </Skeleton>
    <Skeleton className="bg-gray-400 dark:bg-gray-800 text-transparent inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
      {value}
    </Skeleton>
  </div>
);

export default function DistributionLoading() {
  const businessUnits = [
    { text: 'Business Unit Long Text', value: 'XXX' },
    { text: 'Business Unit Text', value: 'XXX' },
    { text: 'Business Text A', value: 'XXX' },
    { text: 'Business', value: 'XXX' },
    { text: 'Business Unit', value: 'XXX' },
    { text: 'Business A', value: 'XX' },
    { text: 'Business Unit Long Text ABD', value: 'XX' },
    { text: 'Business Unit AB', value: 'XX' },
    { text: 'BU Text', value: 'XX' },
    { text: 'Business Unit Text A', value: 'XX' },
    { text: 'BU A', value: 'X' },
    { text: 'Business Text AB', value: 'X' },
    { text: 'Business Text', value: 'X' },
  ];

  return (
    <LoadingCard
      skeleton_h_cn="bg-gray-200 dark:bg-gray-800"
      headerContent="Business Unit Distribution"
      bodyChildren={
        <div className="space-y-2">
          {businessUnits.map((unit, index) => (
            <BusinessUnitSkeletonItem key={index} text={unit.text} value={unit.value} />
          ))}
        </div>
      }
    />
  );
}
