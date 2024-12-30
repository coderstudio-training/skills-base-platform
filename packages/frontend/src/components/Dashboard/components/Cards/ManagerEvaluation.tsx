import { ManagerEvaluationProps } from '@/components/Dashboard/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@radix-ui/react-select';
import { BookOpen } from 'lucide-react';

export default function ManagerEvaluation({ teamMembers }: ManagerEvaluationProps) {
  return (
    <Card>
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
          <SelectContent>
            {teamMembers.map(member => (
              <SelectItem
                key={member.employeeId}
                value={`${member.firstName}-${member.lastName}`.toLowerCase()}
              >
                {member.firstName} {member.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Evaluation Criteria</h3>
          <div className="space-y-4">
            {['Technical Skills', 'Communication', 'Teamwork', 'Problem Solving', 'Initiative'].map(
              (criteria, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{criteria}</span>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(rating => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} -{' '}
                          {rating === 1
                            ? 'Poor'
                            : rating === 2
                              ? 'Fair'
                              : rating === 3
                                ? 'Good'
                                : rating === 4
                                  ? 'Very Good'
                                  : 'Excellent'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Comments</h3>
          <textarea
            className="w-full h-32 p-2 border rounded-md"
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
