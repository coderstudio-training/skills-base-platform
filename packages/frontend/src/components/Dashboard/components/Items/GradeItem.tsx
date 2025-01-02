import { GradeItemProps } from '@/components/Dashboard/types';

export const GradeItem = ({ grade }: GradeItemProps) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-medium">{grade.grade}</span>
    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
      {grade.userCount} {grade.userCount === 1 ? 'user' : 'users'}
    </span>
  </div>
);
