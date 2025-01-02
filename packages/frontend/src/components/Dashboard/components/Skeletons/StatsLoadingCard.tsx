import DistributionLoading from '@/components/Dashboard/components/Skeletons/DistributionLoading';
import RankingLoadingCard from '@/components/Dashboard/components/Skeletons/RankingLoadingCard';
import SkillGapLoadingCard from '@/components/Dashboard/components/Skeletons/SkillGapLoadingCard';

export default function StatsLoadingCard() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <RankingLoadingCard />
      <SkillGapLoadingCard />
      <DistributionLoading />
    </div>
  );
}
