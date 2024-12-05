// // components/Staff/Table/SkillRow.tsx
// import { Progress } from '@/components/ui/progress';
// import { StaffSkill } from '@/types/staff';

// interface SkillRowProps {
//   skill: StaffSkill;
// }

// export function SkillRow({ skill }: SkillRowProps) {
//   const status = getGapStatus(skill.gap);

//   return (
//     <tr className="hover:bg-gray-50">
//       <td className="py-4 px-6 font-medium text-sm w-[30%]">
//         {skill.name}
//       </td>
//       <td className="py-4 px-6 text-sm w-[20%]">
//         <div className="flex items-center gap-2">
//           <Progress value={(skill.selfRating / 6) * 100} className="w-20 h-2" />
//           <span className="text-sm font-normal w-4">{skill.selfRating}</span>
//         </div>
//       </td>
//       <td className="py-4 px-6 text-sm w-[20%]">
//         <div className="flex items-center gap-2">
//           <Progress value={(skill.managerRating / 6) * 100} className="w-20 h-2" />
//           <span className="text-sm font-normal w-4">{skill.managerRating}</span>
//         </div>
//       </td>
//       <td className="py-4 px-6 w-[15%] text-sm">
//         <div className="flex items-center justify-center gap-2">
//           <Progress value={(skill.required / 6) * 100} className="w-20 h-2" />
//           <span className="text-sm font-normal w-4">{skill.required}</span>
//         </div>
//       </td>
//       <td className="py-4 px-6 text-sm w-[15%]">
//         <span className={status.className}>{status.text}</span>
//       </td>
//     </tr>
//   );
// }
