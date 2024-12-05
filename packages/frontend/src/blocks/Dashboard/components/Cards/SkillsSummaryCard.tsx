// import { Card, CardContent } from '@/components/ui/card';
// import { StaffSkill } from '@/types/staff';
// import { MetricsCard } from './MetricsCard';

// interface SkillsAnalyticsProps {
//   skills: StaffSkill[];
// }

// export function StaffAnalytics({ skills }: SkillsAnalyticsProps) {
//   const {
//     averageGap,
//     skillsMeetingRequired,
//     skillsNeedingImprovement,
//     largestGap,
//   } = skills;

//   return (
//     <div className="grid grid-cols-4 gap-4">
//       <MetricsCard
//         title="Average Gap"
//         value={averageGap}
//         decimals={2}
//       />
//       <MetricsCard
//         title="Skills Meeting Required"
//         value={skillsMeetingRequired}
//         decimals={0}
//       />
//       <MetricsCard
//         title="Skills Needing Improvement"
//         value={skillsNeedingImprovement}
//         decimals={0}
//       />
//       <MetricsCard
//         title="Largest Gap"
//         value={largestGap}
//         decimals={2}
//       />
//     </div>
//   );
// }
