import SKillManagerHeader from '@/components/Dashboard/components/Taxonomy/SkillManagerHeader';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function TaxonomyManagerLoading() {
  return (
    <Card className="w-full">
      <SKillManagerHeader buCode="ALL" selectedBusinessUnit="ALL" handleCreate={() => {}} />

      <div className="space-y-4 h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[800px] flex flex-col items-center justify-center align-middle">
        <Loader2 className="h-8 w-8 animate-spin" />
        <div className="text-sm text-muted-foreground">Loading Skills...</div>
      </div>
    </Card>
  );
}
