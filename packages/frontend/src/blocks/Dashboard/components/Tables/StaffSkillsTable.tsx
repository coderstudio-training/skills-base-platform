// import { Progress } from '@/components/ui/progress';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { StaffSkill } from '@/types/staff';
// import { SkillRow } from './StaffSkillsRow';

// interface SkillsTableProps {
//   skills: StaffSkill[];
// }

// export function SkillsTable({ skills }: SkillsTableProps) {
//   return (
//     <div className="rounded-md border">
//       <div className="bg-white border-b">
//         <table className="w-full">
//           <thead>
//             <tr className="text-left">
//               <th className="py-4 px-6 text-gray-600 font-normal w-[30%] text-sm">Skill</th>
//               <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[20%]">Self Rating</th>
//               <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[20%]">Manager Rating</th>
//               <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[15%] text-center">Required Level</th>
//               <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[15%]">Status</th>
//             </tr>
//           </thead>
//         </table>
//       </div>
//       <ScrollArea className="h-[360px]">
//         <div className="px-4">
//           <table className="w-full">
//             <tbody className="divide-y">
//               {skills.map((skill, index) => (
//                 <SkillRow key={index} skill={skill} />
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }
