import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Loader2 } from 'lucide-react';

export default function ManagerEvaluationLoading() {
  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Team Evaluation</CardTitle>
        <CardDescription>Conduct performance evaluations for your team members</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Select a team member to start their performance evaluation:</p>
        <Select>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Select team member" />
          </SelectTrigger>
        </Select>

        <div className="mt-6">
          {' '}
          {/* height dependent on original evaluation criteria list */}
          <h3 className="text-lg font-semibold mb-2">Evaluation Criteria</h3>
          <div className="space-y-4 h-[244px] flex flex-col items-center justify-center align-middle">
            <Loader2 className="h-8 w-8 animate-spin" />
            <div className="text-sm text-muted-foreground">Loading career paths...</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <textarea
            className="w-full h-16 p-2 border rounded-md"
            placeholder="Enter your comments here..."
          ></textarea>
        </div>

        <Button className="mt-4">
          <BookOpen className="mr-2 h-4 w-4" />
          Submit Evaluation
        </Button>
      </CardContent>
    </Card>
  );
}
