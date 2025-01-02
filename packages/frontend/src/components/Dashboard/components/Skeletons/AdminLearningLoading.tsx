import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

export default function AdminLearningLoading() {
  return (
    <BaseCard title="Learning Management" description="Manage career paths and learning resources">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Career Progression Paths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 flex flex-col items-center justify-center align-middle">
              <Loader2 className="h-8 w-8 animate-spin" />
              <div className="text-sm text-muted-foreground">Loading career paths...</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Learning Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full rounded-md">
              <div className="space-y-4 flex flex-col items-center justify-center align-middle">
                <Loader2 className="h-8 w-8 animate-spin" />
                <div className="text-sm text-muted-foreground">Loading learning resources...</div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Path Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 flex flex-col items-center justify-center align-middle">
              <Loader2 className="h-8 w-8 animate-spin" />
              <div className="text-sm text-muted-foreground">Loading path progress...</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resource Management</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 flex flex-col items-center justify-center align-middle">
                <Loader2 className="h-8 w-8 animate-spin" />
                <div className="text-sm text-muted-foreground">Loading management resources...</div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </BaseCard>
  );
}
