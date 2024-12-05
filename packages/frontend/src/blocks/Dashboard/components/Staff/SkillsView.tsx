// // components/Staff/StaffSkillsView.tsx
// 'use client';

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { CustomBarChart } from '@/components/ui/barchart';
// import { Button } from '@/components/ui/button';
// import { useSkillsData } from '../../hooks/useSkills';
// import { useSession } from 'next-auth/react';
// import { useState } from 'react';
// import { ResponsiveContainer } from 'recharts';
// import { SkillSummaryResponse } from '../../types';
// // import { StaffAnalytics } from '../Cards/StaffAnalyticsCard';
// // import { SkillsTable } from '../Tables/StaffSkillsTable';

// interface SkillsViewProps {
//   skillsData: SkillSummaryResponse | null;
// }

// export default function StaffSkillsView({skillsData}: SkillsViewProps) {
//   const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
//     'Technical Skills',
//   );

//   if (!skillsData) {
//     console.log('No skills data available');
//     return <div>No skills data available</div>;
//   }

//   const { metrics, skills } = skillsData;

//   if (!metrics || !skills) {
//     console.log('Invalid data structure:', skillsData);
//     return <div>Invalid data structure received</div>;
//   }

//   return (
//     <SkillsSummaryCard skills={skills} />
//   );
// }
