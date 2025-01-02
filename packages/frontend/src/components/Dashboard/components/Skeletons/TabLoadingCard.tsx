import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { Loader2 } from 'lucide-react';

export default function TabLoadingCard({
  title,
  description,
  loading_message = 'Loading',
  height = '[566px]',
}: {
  title: string;
  description: string;
  loading_message?: string;
  height?: string;
}) {
  // height is derived from the height of the largest tab content. Used for uniformity when switching tabs
  return (
    <div className="mt-2">
      <BaseCard title={title} description={description}>
        <div
          className={`space-y-8 h-${height} flex flex-col items-center justify-center align-middle`}
        >
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="text-sm text-muted-foreground">{loading_message}...</div>
        </div>
      </BaseCard>
    </div>
  );
}
