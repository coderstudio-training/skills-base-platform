import BaseCard from '@/components/Dashboard/components/Cards/BaseCard';
import { TeamMembersListProps } from '@/components/Dashboard/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function IndividualPerformanceCard({
  members,
  loading,
  error,
}: TeamMembersListProps) {
  return (
    <BaseCard
      title="Individual Performance"
      description="Average team performance over the last 6 months"
      loading={loading}
      error={error}
      errorMessage={'Error loading individual performance'}
      loadingMessage="Loading team members performance..."
    >
      <ScrollArea className="h-[566px]">
        <div className="space-y-4 pr-4">
          {members.map(member => (
            <div
              key={member.employeeId}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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
              <div className="flex items-center gap-4">
                <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black dark:bg-white rounded-full"
                    style={{ width: `90%` }}
                  />
                </div>
                <span className="font-medium w-12 text-right">90%</span>
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
