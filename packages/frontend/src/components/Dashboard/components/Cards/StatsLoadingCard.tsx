import DistributionLoading from './DistributionLoading';
import RankingLoadingCard from './RankingLoadingCard';
import SkillGapLoadingCard from './SkillGapLoadingCard';

export default function StatsLoadingCard() {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-6">
      <RankingLoadingCard />
      <SkillGapLoadingCard />
      <DistributionLoading />
    </div>
  );
}
