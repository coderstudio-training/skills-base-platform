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
//     <Card className="w-full">
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <CardTitle>Skills Gap Analysis</CardTitle>
//           <div className="space-x-2">
//             <Button
//               variant={selectedCategory === 'Technical Skills' ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setSelectedCategory('Technical Skills')}
//             >
//               Technical Skills
//             </Button>
//             <Button
//               variant={selectedCategory === 'Soft Skills' ? 'default' : 'outline'}
//               size="sm"
//               onClick={() => setSelectedCategory('Soft Skills')}
//             >
//               Soft Skills
//             </Button>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="h-[450px] w-full">
//           <ResponsiveContainer width="100%" height={500}>
//             <CustomBarChart
//               data={transformedChartData}
//               xAxisKey="skill"
//               series={[
//                 { key: 'average', name: 'Current Level', color: '#4285f4' },
//                 { key: 'requiredRating', name: 'Required Level', color: '#666666' },
//                 { key: 'gap', name: 'Skill Gap', color: '#dc2626' },
//               ]}
//             />
//           </ResponsiveContainer>
//         </div>

//         <div className="mt-8">
//           <h3 className="text-md font-semibold mb-2">Detailed Gap Analysis</h3>
//           <p className="text-sm text-gray-600 mb-4">
//             Breakdown of your {selectedCategory.toLowerCase()}
//           </p>
//           <SkillsTable skills={filteredSkills} />
//         </div>

//         <div className="mt-8">
//           <h4 className="text-md font-semibold mb-2">Summary</h4>
//           <StaffAnalytics skills={filteredSkills} />
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
