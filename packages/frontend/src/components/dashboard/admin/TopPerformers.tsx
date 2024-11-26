import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TopPerformer, TopPerformersResponse } from '@/types/admin';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopPerformers() {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/skills/rankings');
        if (!response.ok) throw new Error('Failed to fetch top performers');
        const data: TopPerformersResponse = await response.json();
        setTopPerformers(data.rankings.slice(0, 10));
      } catch (error) {
        console.error('Error fetching top performers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPerformers();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold leading-none tracking-tight">Top Performers</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading top performers...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-muted/50 rounded-t-lg">
              <div className="grid grid-cols-12 px-4 py-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-2">Rank</div>
                <div className="col-span-8">Employee Name</div>
                <div className="col-span-2 text-right">Score</div>
              </div>
            </div>

            <ScrollArea className="h-[350px]">
              <div className="divide-y">
                {topPerformers.map(performer => (
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
