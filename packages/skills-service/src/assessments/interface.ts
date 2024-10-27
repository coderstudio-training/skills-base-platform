import { BaseSkillsDto } from "./dto/assessments.dto";
import { RequiredSkillsDto } from "./dto/required-skills.dto";

export interface IBulkUpdateDto {
    data: BaseSkillsDto[] | RequiredSkillsDto[];
  }
  

  