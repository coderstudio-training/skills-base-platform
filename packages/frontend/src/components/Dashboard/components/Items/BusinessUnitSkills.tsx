import { SkillItem } from '@/components/Dashboard/components/Items/SkillItem';
import { BUSINESS_UNITS } from '@/components/Dashboard/constants';
import { BusinessUnitSkillsProps } from '@/components/Dashboard/types';

export const BusinessUnitSkills = ({ businessUnit }: BusinessUnitSkillsProps) => {
  const getBusinessUnitName = (code: string) => {
    if (Object.keys(BUSINESS_UNITS).includes(code)) {
      return BUSINESS_UNITS[code as keyof typeof BUSINESS_UNITS];
    }
    return code;
  };

  const technicalSkills = businessUnit.categories?.find(
    category => category.category === 'Technical Skills',
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-primary">
        {getBusinessUnitName(businessUnit.businessUnit)}
      </h3>
      <div className="space-y-2">
        {technicalSkills?.skills?.map((skill, index) => <SkillItem key={index} skill={skill} />)}
      </div>
    </div>
  );
};
