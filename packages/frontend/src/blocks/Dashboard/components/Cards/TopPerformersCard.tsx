import { useTopPerformers } from '@/blocks/Dashboard/hooks/useTopPerformers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import BaseCard from './BaseCard';

export function TopPerformers() {
  const { rankings, loading } = useTopPerformers();

  return (
    <BaseCard title="Top Performers" loading={loading} loadingMessage="Loading top performers...">
      <div className="bg-muted/50 rounded-t-lg">
        <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium text-muted-foreground">
          <div className="col-span-2">Rank</div>
          <div className="col-span-8">Employee Name</div>
          <div className="col-span-2 text-right">Score</div>
        </div>
      </div>

      <ScrollArea className="h-[350px]">
        <div className="divide-y">
          {rankings.map(performer => (
            <div
              key={performer.ranking}
              className={cn(
                'grid grid-cols-12 px-4 py-3 items-center transition-colors hover:bg-muted/50',
                performer.ranking <= 5 && 'bg-muted/20',
              )}
            >
              <div className="col-span-2 flex items-center gap-2">
                <span className="font-medium">{performer.ranking}</span>
              </div>
              <div className="col-span-8">{performer.name}</div>
              <div className="col-span-2 text-right">{performer.score}</div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </BaseCard>
  );
}
