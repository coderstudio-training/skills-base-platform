// packages/frontend/src/lib/type-guards.ts
import type { BackendSkillResponse, SkillsResponse } from '@/types/api';

export function isSkillsResponse(
  response: SkillsResponse | BackendSkillResponse[],
): response is SkillsResponse {
  return (
    !Array.isArray(response) &&
    'metrics' in response &&
    typeof response.metrics === 'object' &&
    response.metrics !== null &&
    'technicalSkillsAverage' in response.metrics
  );
}

export function calculateMetricsFromBackendResponse(
  response: BackendSkillResponse[],
): SkillsResponse['metrics'] {
  const allSkills = response.flatMap(item => item.skills);

  const technicalSkills = allSkills.filter(skill => skill.category === 'Technical Skills');
  const softSkills = allSkills.filter(skill => skill.category === 'Soft Skills');

  const technicalAverage =
    technicalSkills.length > 0
      ? Number(
          (
            technicalSkills.reduce((sum, skill) => sum + skill.average, 0) / technicalSkills.length
          ).toFixed(2),
        )
      : 0;

  const softAverage =
    softSkills.length > 0
      ? Number(
          (softSkills.reduce((sum, skill) => sum + skill.average, 0) / softSkills.length).toFixed(
            2,
          ),
        )
      : 0;

  return {
    technicalSkillsAverage: technicalAverage,
    softSkillsAverage: softAverage,
    skillsAssessed: allSkills.length,
  };
}
