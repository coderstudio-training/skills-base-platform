import TSCManagerHeader from '@/components/Dashboard/components/TSC/TSCManagerHeader';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TSCManagerLoading() {
  return (
    <Card className="w-full">
      <TSCManagerHeader buCode="ALL" selectedBusinessUnit="ALL" handleCreate={() => {}} />

      <div className="space-y-4 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[800px] flex flex-col items-center justify-center align-middle">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="text-sm text-muted-foreground">Loading TSCs...</div>
      </div>
    </Card>
  );
}
