import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSkills } from '@/lib/api';
import { StaffSkill } from '@/types/staff';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { CustomBarChart } from '../../ui/barchart';

const calculateSummaryMetrics = (skills: StaffSkill[]) => {
  const averageGap = Number(
    (skills.reduce((sum, skill) => sum + skill.gap, 0) / skills.length).toFixed(2),
  );

  const skillsMeetingRequired = skills.filter(skill => skill.gap >= 0).length;
  const skillsNeedingImprovement = skills.filter(skill => skill.gap < 0).length;
  const largestGap = Math.max(...skills.map(skill => skill.gap));

  return {
    averageGap,
    skillsMeetingRequired,
    skillsNeedingImprovement,
    largestGap,
  };
};

const getGapStatus = (gap: number) => {
  if (gap >= 0)
    return {
      text: 'Proficient',
      className: 'text-white bg-green-500 px-2 py-1 rounded-md text-sm font-medium',
    };
  return {
    text: 'Developing',
    className: 'text-white bg-orange-500 px-2 py-1 rounded-md text-sm font-medium',
  };
};

export default function StaffSkillsView() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<StaffSkill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
    'Technical Skills',
  );

  useEffect(() => {
    const fetchSkills = async () => {
      if (!session?.user?.email) {
        setError('User email not found in session');
        return;
      }
      setLoading(true);
      try {
        const data = await getSkills();

        // Narrowing type to check if data is SkillsResponse or BackendSkillResponse[]
        if (Array.isArray(data)) {
          // If data is an array of BackendSkillResponse
          const allSkills = data.flatMap(employee => employee.skills);
          setSkills(allSkills);
        } else {
          // If data is SkillsResponse
          setSkills(data.skills);
        }
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Failed to fetch skills data';
        console.error('Error fetching skills data:', err);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchSkills();
  }, [session]);

  const filteredSkills = skills.filter(skill => skill.category === selectedCategory);

  const transformedChartData = filteredSkills.map(skill => ({
    skill: skill.skill,
    gap: skill.gap,
    selfRating: skill.selfRating,
    managerRating: skill.managerRating,
    average: skill.average,
    requiredRating: skill.requiredRating,
    [skill.skill]: skill.average, // This is needed for the chart to work properly
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Skills Gap Analysis</CardTitle>
          <div className="space-x-2">
            <Button
              variant={selectedCategory === 'Technical Skills' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('Technical Skills')}
            >
              Technical Skills
            </Button>
            <Button
              variant={selectedCategory === 'Soft Skills' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('Soft Skills')}
            >
              Soft Skills
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height={500}>
                <CustomBarChart
                  data={transformedChartData}
                  xAxisKey="skill"
                  series={[
                    { key: 'average', name: 'Current Level', color: '#4285f4' },
                    { key: 'requiredRating', name: 'Required Level', color: '#666666' },
                    { key: 'gap', name: 'Skill Gap', color: '#dc2626' },
                  ]}
                />
              </ResponsiveContainer>
            </div>
            <div className="mt-8">
              <h3 className="text-md font-semibold mb-2">Detailed Gap Analysis</h3>
              <p className="text-sm text-gray-600 mb-4">
                Breakdown of your {selectedCategory.toLowerCase()}
              </p>

              <div className="rounded-md border">
                <div className="bg-white border-b">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th
                          className="py-4 px-6 text-gray-600 font-normal w-[30%] text-sm"
                          style={{ paddingLeft: '24px' }}
                        >
                          Skill
                        </th>
                        <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[20%]">
                          Self Rating
                        </th>
                        <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[20%]">
                          Manager Rating
                        </th>
                        <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[15%] text-center">
                          Required Level
                        </th>
                        <th className="py-4 px-6 text-gray-600 font-normal text-sm w-[15%]">
                          Status
                        </th>
                      </tr>
                    </thead>
                  </table>
                </div>

                <ScrollArea className="h-[360px]">
                  <div className="px-4">
                    <table className="w-full">
                      <tbody className="divide-y">
                        {filteredSkills.map((skill, index) => {
                          const status = getGapStatus(skill.gap);
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td
                                className="py-4 px-6 font-medium text-sm w-[30%]"
                                style={{ paddingLeft: '24px' }}
                              >
                                {skill.skill}
                              </td>
                              <td className="py-4 px-6 text-sm w-[20%]">
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={(skill.selfRating / 6) * 100}
                                    className="w-20 h-2"
                                  />
                                  <span className="text-sm font-normal w-4">
                                    {skill.selfRating}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm w-[20%]">
                                <div className="flex items-center gap-2">
                                  <Progress
                                    value={(skill.managerRating / 6) * 100}
                                    className="w-20 h-2"
                                  />
                                  <span className="text-sm font-normal w-4">
                                    {skill.managerRating}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 w-[15%] text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <Progress
                                    value={(skill.requiredRating / 6) * 100}
                                    className="w-20 h-2"
                                  />
                                  <span className="text-sm font-normal w-4">
                                    {skill.requiredRating}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm w-[15%]">
                                <span className={status.className}>{status.text}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </div>
            </div>
            <div className="mt-8">
              <h4 className="text-md font-semibold mb-2">Summary</h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Average Gap</p>
                  <p className="text-2xl font-medium">
                    {calculateSummaryMetrics(filteredSkills).averageGap}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Skills Meeting Required</p>
                  <p className="text-2xl font-medium">
                    {calculateSummaryMetrics(filteredSkills).skillsMeetingRequired}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Skills Needing Improvement</p>
                  <p className="text-2xl font-medium">
                    {calculateSummaryMetrics(filteredSkills).skillsNeedingImprovement}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Largest Gap</p>
                  <p className="text-2xl font-medium">
                    {calculateSummaryMetrics(filteredSkills).largestGap}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
