'use client';

import { UserHeader } from '@/components/Dashboard/components/Header/UserHeader';
import { ManagerOverview } from '@/components/Dashboard/components/Manager/ManagerOverview';
import { useTeamData } from '@/components/Dashboard/hooks/useTeamData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { usePermissions } from '../../hooks/usePermissions';
import { DashboardProps } from '../../types';
import { IndividualPerformanceCard } from '../Cards/IndividualPerformanceCard';
import SkillsView from './SkillsView';
import Training from './Training';

export default function ManagerDashboard(user: DashboardProps) {
  const { hasPermission } = usePermissions();
  const managerName = user.name;
  const [activeTab, setActiveTab] = useState('overview');
  const { teamMembers } = useTeamData(managerName);

  if (!hasPermission('canManageTeam')) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          You dont have permission to access the manager dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-full lg:max-w-[80%]">
      <UserHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        {hasPermission('canManageTeam') && (
          <TabsContent value="overview" className="space-y-4">
            <ManagerOverview teamMembers={teamMembers} />
          </TabsContent>
        )}

        {hasPermission('canViewReports') && (
          <TabsContent value="performance">
            <IndividualPerformanceCard members={teamMembers} />
          </TabsContent>
        )}

        {hasPermission('canEditTeamSkills') && (
          <TabsContent value="skills">
            <SkillsView name={managerName || ''} />
          </TabsContent>
        )}

        {hasPermission('canEditTeamLearning') && (
          <TabsContent value="training">
            <Training name={managerName || ''} />
          </TabsContent>
        )}

        {hasPermission('canManageTeam') && (
          <TabsContent value="evaluation">
            <Card>
              <CardHeader>
                <CardTitle>Team Evaluation</CardTitle>
                <CardDescription>
                  Conduct performance evaluations for your team members
                </CardDescription>
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
                    {[
                      'Technical Skills',
                      'Communication',
                      'Teamwork',
                      'Problem Solving',
                      'Initiative',
                    ].map((criteria, index) => (
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
                    ))}
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
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
