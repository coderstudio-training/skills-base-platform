import { ViewSkillsButton } from '@/components/Dashboard/components/Buttons/ViewSkillsButton';
import { SkillsDialogProps } from '@/components/Dashboard/types'; // Adjust the import path as needed
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSkillLevelLabel, getSkillStatusIcon } from '@/lib/utils/skill-utils';
import { Loader2 } from 'lucide-react';

export function SkillsDialog({
  selectedEmployee,
  skills,
  loading,
  onOpenChange,
  onViewSkills,
  EmployeeDetails,
}: SkillsDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <ViewSkillsButton
          onClick={() =>
            onViewSkills(
              EmployeeDetails.email,
              `${EmployeeDetails.firstName} ${EmployeeDetails.lastName}`,
            )
          }
        />
      </DialogTrigger>
      {selectedEmployee && (
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{`${selectedEmployee.name}'s Skills`}</DialogTitle>
            <DialogDescription>Skill levels and proficiencies</DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[500px] gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading skills data...</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] w-full pr-4">
              <div className="space-y-4">
                {skills.length > 0 ? (
                  skills.map(skill => (
                    <div key={skill.skill} className="space-y-2 border-b pb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{skill.skill}</span>
                        <div className="flex items-center space-x-2">
                          <Progress
                            value={(skill.average / skill.requiredRating) * 100}
                            className="w-[100px]"
                          />
                          <span className="text-sm text-gray-500">
                            {getSkillLevelLabel(skill.average)}
                          </span>
                          {getSkillStatusIcon(skill.average, skill.requiredRating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {skill.description || 'No description available'}
                      </p>
                      <p className="text-sm font-medium">
                        Current Level:{' '}
                        {skill.proficiencyDescription || 'No proficiency description available'}
                      </p>
                      <div className="flex justify-between text-sm">
                        <span>Self Assessment: {getSkillLevelLabel(skill.selfRating)}</span>
                        <span>Manager Assessment: {getSkillLevelLabel(skill.managerRating)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No skills data available for this employee
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
