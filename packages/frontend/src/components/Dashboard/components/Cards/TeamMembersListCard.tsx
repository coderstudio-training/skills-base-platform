import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { TeamMembersListProps } from '@/components/Dashboard/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function TeamMembersListCard({ members, loading, error }: TeamMembersListProps) {
  return (
    <BaseCard
      title="Team Members"
      description="List of your team members"
      loading={loading}
      error={error}
      errorMessage={'Error loading team members'}
      loadingMessage="Loading team members..."
    >
      <ScrollArea className="h-[400px]">
        <div className="space-y-4 pr-4">
          {members.map(member => (
            <div
              key={member.employeeId}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
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
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center text-gray-500">No team members found</div>
          )}
        </div>
      </ScrollArea>
    </BaseCard>
  );
}
