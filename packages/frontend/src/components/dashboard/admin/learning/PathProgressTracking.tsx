'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const PROGRESS_DATA = [
  {
    path: 'QA Foundation Path',
    activeUsers: 15,
    completion: 75,
    certifications: 10,
  },
  {
    path: 'QA Professional Path',
    activeUsers: 12,
    completion: 60,
    certifications: 8,
  },
];

export function PathProgressTracking() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Path Progress Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {PROGRESS_DATA.map((progress, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{progress.path}</span>
                <Badge variant="outline">{progress.activeUsers} users</Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Completion Rate</span>
                  <span>{progress.completion}%</span>
                </div>
                <Progress value={progress.completion} className="h-2" />
              </div>
              <div className="flex justify-between text-sm">
                <span>Certifications Achieved</span>
                <Badge variant="secondary">{progress.certifications}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
