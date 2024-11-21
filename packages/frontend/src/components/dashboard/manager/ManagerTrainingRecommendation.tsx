import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MemberRecommendations, TeamMember } from '@/types/manager';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const ManagerTrainingRecommendation = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<
    Array<TeamMember & { recommendations?: MemberRecommendations }>
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.name) return;

      try {
        setLoading(true);
        // Fetch team members
        const teamResponse = await fetch(
          `/api/employees/manager/${encodeURIComponent(session.user.name)}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
            },
          },
        );

        if (!teamResponse.ok) {
          throw new Error('Failed to fetch team members');
        }

        const teamMembers = await teamResponse.json();

        // Fetch recommendations for each team member
        const membersWithRecommendations = await Promise.all(
          teamMembers.map(async (member: TeamMember) => {
            try {
              const recResponse = await fetch(
                `/api/learning/recommendations/${encodeURIComponent(member.email)}`,
              );
              const recommendations = await recResponse.json();
              return {
                ...member,
                recommendations,
              };
            } catch (err) {
              console.error(`Error fetching recommendations for ${member.email}:`, err);
              return member;
            }
          }),
        );

        setTeamData(membersWithRecommendations);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.name, session?.user?.accessToken]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64 text-red-500">
          {error}
        </CardContent>
      </Card>
    );
  }

  const getTrainingTypeDisplay = (type: 'skillGap' | 'promotion') => {
    return type === 'skillGap' ? 'Required Skills' : 'For Promotion';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Recommendations</CardTitle>
        <CardDescription>Personalized course recommendations based on skill gaps</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          <div className="space-y-8">
            {teamData.map(member => (
              <div key={member.employeeId} className="space-y-4 pb-6 border-b last:border-b-0">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    {member.picture ? (
                      <AvatarImage
                        src={member.picture}
                        alt={`${member.firstName} ${member.lastName}`}
                      />
                    ) : (
                      <AvatarFallback>{`${member.firstName[0]}${member.lastName[0]}`}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold">{`${member.firstName} ${member.lastName}`}</p>
                    <p className="text-sm text-muted-foreground">{member.designation}</p>
                  </div>
                </div>

                {member.recommendations?.recommendations.length ? (
                  <div className="space-y-4">
                    {member.recommendations.recommendations.map((rec, index) => (
                      <Card key={index} className="p-4">
                        <CardTitle className="text-lg mb-2">{rec.course.name}</CardTitle>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-semibold">Skill:</span> {rec.skillName}
                          </div>
                          <div>
                            <span className="font-semibold">Provider:</span> {rec.course.provider}
                          </div>
                          <div>
                            <span className="font-semibold">Duration:</span> {rec.course.duration}
                          </div>
                          <div>
                            <span className="font-semibold">Format:</span> {rec.course.format}
                          </div>
                          <div>
                            <span className="font-semibold">Prerequisites:</span>{' '}
                            {rec.course.prerequisites}
                          </div>
                          <div>
                            <span className="font-semibold">Training Focus:</span>{' '}
                            {getTrainingTypeDisplay(rec.type)}
                          </div>
                          <div>
                            <span className="font-semibold">Current Level:</span>
                            <Progress
                              value={rec.currentLevel * 20}
                              className="w-[60px] inline-block ml-2"
                            />
                            {rec.currentLevel}
                          </div>
                          <div>
                            <span className="font-semibold">Target Level:</span>
                            <Progress
                              value={rec.targetLevel * 20}
                              className="w-[60px] inline-block ml-2"
                            />
                            {rec.targetLevel}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="ml-12 text-sm text-muted-foreground">
                    No training recommendations available.
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ManagerTrainingRecommendation;
