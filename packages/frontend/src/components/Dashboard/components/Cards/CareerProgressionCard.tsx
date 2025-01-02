'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const CAREER_PATHS = [
  {
    pathId: 'PATH001',
    name: 'QA Foundation Path',
    level: 'Professional I',
    target: 2,
    courses: 3,
    duration: '6 months',
    commitment: '5-10 hours',
  },
  {
    pathId: 'PATH002',
    name: 'QA Professional Path',
    level: 'Professional II',
    target: 3,
    courses: 3,
    duration: '9 months',
    commitment: '8-12 hours',
  },
];

export function CareerProgressionPaths() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Progression Paths</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {CAREER_PATHS.map(path => (
            <div key={path.pathId} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{path.name}</h4>
                  <p className="text-sm text-gray-500">{path.level}</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{path.name}</DialogTitle>
                      <DialogDescription>Career path details and courses</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Target Level</Label>
                          <p className="text-sm mt-1">Level {path.target}</p>
                        </div>
                        <div>
                          <Label>Duration</Label>
                          <p className="text-sm mt-1">{path.duration}</p>
                        </div>
                        <div>
                          <Label>Weekly Commitment</Label>
                          <p className="text-sm mt-1">{path.commitment}</p>
                        </div>
                        <div>
                          <Label>Number of Courses</Label>
                          <p className="text-sm mt-1">{path.courses} courses</p>
                        </div>
                      </div>
                      <div>
                        <Label>Prerequisites</Label>
                        <p className="text-sm mt-1">Complete previous path + required experience</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Target Level</span>
                  <Badge variant="secondary">Level {path.target}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Duration</span>
                  <span>{path.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Commitment</span>
                  <span>{path.commitment}/week</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
