import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TeamMember } from '@/types/manager';

interface TeamMembersListProps {
  loading: boolean;
  error: string | null;
  members: TeamMember[];
  showPerformance?: boolean;
}

const TeamMembersList = ({
  loading,
  error,
  members,
  showPerformance = true,
}: TeamMembersListProps) => {
  const renderLoadingState = () => (
    <div className="space-y-4 pr-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div
          key={i}
          className="flex items-center justify-between p-2 rounded-lg bg-gray-50 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
          {showPerformance && (
            <div className="flex items-center">
              <div className="h-4 w-12 bg-gray-200 rounded" />
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="flex items-center justify-center h-full text-red-500">
      <p>{error}</p>
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-[300px] text-gray-500">
      No team members found
    </div>
  );

  const renderMembersList = () => (
    <div className="space-y-4 pr-4">
      {members.map(member => (
        <div
          key={member.email}
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {member.picture ? (
                <AvatarImage
                  src={member.picture}
                  alt={`${member.firstName} ${member.lastName}`}
                  width={40}
                  height={40}
                  onError={e => {
                    const imgElement = e.target as HTMLImageElement;
                    imgElement.style.display = 'none';
                  }}
                />
              ) : null}
              <AvatarFallback className="uppercase bg-gray-100 text-gray-600">
                {member.firstName?.[0]}
                {member.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {member.firstName} {member.lastName}
              </p>
              <p className="text-sm text-gray-500">{`${member.jobLevel} ${member.designation}`}</p>
            </div>
          </div>
          {showPerformance && member.performanceScore && (
            <div className="flex items-center">
              <span className="font-medium">{member.performanceScore}%</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="font-bold mb-1">Team Members List</h3>
        <p className="text-sm text-gray-500 mb-4">List of your team members</p>
        <ScrollArea className="h-[300px] w-full">
          {loading && renderLoadingState()}
          {error && renderErrorState()}
          {!loading && !error && members.length === 0 && renderEmptyState()}
          {!loading && !error && members.length > 0 && renderMembersList()}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TeamMembersList;
