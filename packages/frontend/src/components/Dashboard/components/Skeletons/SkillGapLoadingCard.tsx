import LoadingCard from '@/components/Dashboard/components/Skeletons/LoadingCard';
import { Skeleton } from '@/components/ui/skeleton';

const SkillGapSkeletonItem = ({ text }: { text: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-sm">
      <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-md">
        {text}
      </Skeleton>
      <Skeleton className="bg-gray-300 dark:bg-gray-700 text-transparent w-fit rounded-lg">
        X.X
      </Skeleton>
    </div>
    <div
      aria-valuemax={100}
      aria-valuemin={0}
      className="animate-pulse bg-gray-400 relative w-full overflow-hidden rounded-full bg-primary/20 h-2.5"
    ></div>
  </div>
);

export default function SkillGapLoadingCard() {
  const skillItems = [
    'Just Some Long Text',
    'Just Some Long Text Variation 1',
    'Just Text',
    'Just Some Text',
    'Just Some Long Text Var 2',
  ];

  return (
    <LoadingCard
      headerContent="Skill Gap"
      skeleton_h_cn="bg-gray-200 dark:bg-gray-800 "
      bodyChildren={
        <div className="space-y-4">
          {skillItems.map((item, index) => (
            <SkillGapSkeletonItem key={index} text={item} />
          ))}
        </div>
      }
    />
  );
}
