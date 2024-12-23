import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

type StatusType = 'WARNING' | 'CRITICAL' | 'NORMAL';

export const StatusIcon = ({ status }: { status: StatusType }) => {
  switch (status) {
    case 'CRITICAL':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'WARNING':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'NORMAL':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};
