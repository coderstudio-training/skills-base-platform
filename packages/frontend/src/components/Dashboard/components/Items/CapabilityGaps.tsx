import { BUSINESS_UNITS } from '../../constants';
import { CapabilityGapsProps } from '../../types';
import { SkillGapItem } from './SkillGapItem';

export const CapabilityGaps = ({ capability }: CapabilityGapsProps) => {
  const getBusinessUnitName = (code: string) => {
    if (Object.keys(BUSINESS_UNITS).includes(code)) {
      return BUSINESS_UNITS[code as keyof typeof BUSINESS_UNITS];
    }
    return code;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-primary">
        {getBusinessUnitName(capability.capability)}
      </h3>
      {capability.skillGaps
        .sort((a, b) => a.gap - b.gap)
        .slice(0, 5)
        .map((skill, index) => (
          <SkillGapItem key={index} skill={skill} />
        ))}
    </div>
  );
};
