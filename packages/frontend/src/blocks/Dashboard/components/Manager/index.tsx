'use client';

import { useTeamData } from '@/blocks/Dashboard/hooks/useTeamData';
import ManagerDashboardHeader from '@/components/shared/ManagerDashboardHeader';
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
import { ManagerOverview } from './ManagerOverview';
import SkillsView from './SkillsView';
import Training from './Training';

export function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { session, teamMembers, loading, error } = useTeamData();

  return (
    <div className="container mx-auto p-4 max-w-[80%]">
      <ManagerDashboardHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Manager Overview*/}
          <ManagerOverview teamMembers={teamMembers} loading={loading} error={error} />
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-4">
            {/* <TeamMembersList
              loading={loading}
              error={error?.toString() || null}
              members={teamMembers}
              showPerformance
            /> */}
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <SkillsView name={session?.user?.name || ''} />
        </TabsContent>

        <TabsContent value="training">
          <Training />
        </TabsContent>

        <TabsContent value="evaluation">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading team members...</p>
              </CardContent>
            </Card>
          ) : (
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
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
