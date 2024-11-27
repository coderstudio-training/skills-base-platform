'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSkills } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Employee } from '@/types/admin';
import { TeamMemberWithSkills } from '@/types/manager';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function ManagerSkillsView() {
  const { data: session } = useSession();
  const [teamSkills, setTeamSkills] = useState<TeamMemberWithSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkillsData = async () => {
      try {
        setLoading(true);

        // Fetch team members
        const teamResponse = await fetch(
          `/api/employees/manager/${encodeURIComponent(session?.user?.name || '')}`,
          {
            headers: {
              Authorization: `Bearer ${session?.user?.accessToken}`,
            },
          },
        );
        const teamMembers = await teamResponse.json();

        // Fetch skills data (can return either SkillsResponse or BackendSkillResponse[])
        const skillsData = await getSkills();

        if (Array.isArray(skillsData)) {
          // skillsData is of type BackendSkillResponse[]
          const membersWithSkills = await Promise.all(
            teamMembers.map(async (member: Employee) => {
              const memberSkills =
                skillsData.find(employee => employee.employeeInfo.email === member.email)?.skills ||
                [];
              return { ...member, skills: memberSkills };
            }),
          );
          setTeamSkills(membersWithSkills);
        } else if (skillsData.skills) {
          // skillsData is of type SkillsResponse
          const membersWithSkills = await Promise.all(
            teamMembers.map(async (member: Employee) => {
              const memberSkills = skillsData.skills.filter(skill => skill.email === member.email);
              return { ...member, skills: memberSkills };
            }),
          );
          setTeamSkills(membersWithSkills);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching skills data:', err);
        setError('Failed to fetch skills data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.accessToken && session?.user?.name) {
      fetchSkillsData();
    }
  }, [session?.user?.accessToken, session?.user?.name]);

  console.log(teamSkills);

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold">Team Skills Breakdown</h3>
        <p className="text-sm text-muted-foreground mb-4">Detailed view of individual skills</p>
        <ScrollArea className="h-[500px] w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p>Loading team skills...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <div className="space-y-6 pr-4">
              {teamSkills.map(member => (
                <div
                  key={member.email}
                  className="space-y-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      {member.picture ? (
                        <AvatarImage
                          src={member.picture}
                          alt={`${member.firstName} ${member.lastName}`}
                          onError={e => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <AvatarFallback className="uppercase bg-secondary text-secondary-foreground">
                        {member.firstName?.[0]}
                        {member.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-base font-semibold">
                            {member.firstName} {member.lastName}
                          </h4>
                          <p className="text-sm text-muted-foreground">{member.designation}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {member.skills
                          .sort((a, b) => b.average - a.average)
                          .map((skill, skillIndex) => (
                            <Badge
                              key={skillIndex}
                              variant="outline"
                              className={cn(
                                skill.gap >= 0
                                  ? 'text-white rounded-md bg-green-500 hover:bg-green-600'
                                  : 'text-white rounded-md bg-red-500 hover:bg-red-600',
                              )}
                            >
                              {skill.skill}: {skill.average.toFixed(1)}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {teamSkills.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No team skills data available
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
