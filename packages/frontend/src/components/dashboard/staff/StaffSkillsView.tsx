import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSkillMatrix } from '@/lib/api';
import { StaffSkill } from '@/types/staff';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { CustomBarChart } from '../../ui/barchart';

const getGapStatus = (gap: number) => {
  if (gap < -2)
    return {
      text: 'Critical',
      className: 'text-red-600 bg-red-100 px-2 py-1 rounded-full text-sm',
    };
  if (gap < 0)
    return {
      text: 'Developing',
      className: 'text-yellow-500 bg-yellow-100 px-2 py-1 rounded-full text-sm',
    };
  if (gap < 1)
    return {
      text: 'Sufficient',
      className: 'text-green-500 bg-green-100 px-2 py-1 rounded-full text-sm',
    };
  return {
    text: 'Proficient',
    className: 'text-blue-500 bg-blue-100 px-2 py-1 rounded-full text-sm',
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
        const data = await getSkillMatrix();

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
            <div className="h-[500px] w-full">
              <ResponsiveContainer width="100%" height={500}>
                <CustomBarChart
                  data={transformedChartData}
                  xAxisKey="skill"
                  series={[
                    { key: 'average', name: 'Current Level', color: '#4285f4' },
                    { key: 'requiredRating', name: 'Required Level', color: '#666666' },
                  ]}
                />
              </ResponsiveContainer>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Skill Details</h3>
              <p className="text-sm text-gray-600 mb-4">
                Breakdown of your {selectedCategory.toLowerCase()}
              </p>

              <div className="rounded-md border">
                <div className="bg-white border-b">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th
                          className="py-4 px-6 font-medium w-[30%]"
                          style={{ paddingLeft: '24px' }}
                        >
                          Skill
                        </th>
                        <th className="py-4 px-6 font-medium w-[20%]">Self Rating</th>
                        <th className="py-4 px-6 font-medium w-[20%]">Manager Rating</th>
                        <th className="py-4 px-6 font-medium w-[15%] text-center">
                          Required Level
                        </th>
                        <th className="py-4 px-6 font-medium w-[15%]">Status</th>
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
                              <td className="py-4 px-6 w-[30%]" style={{ paddingLeft: '24px' }}>
                                {skill.skill}
                              </td>
                              <td className="py-4 px-6 w-[20%]">
                                <div className="flex items-center gap-4">
                                  <Progress value={skill.selfRating * 20} className="w-32" />
                                  <span className="text-sm font-medium w-4">
                                    {skill.selfRating}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 w-[20%]">
                                <div className="flex items-center gap-4">
                                  <Progress value={skill.managerRating * 20} className="w-32" />
                                  <span className="text-sm font-medium w-4">
                                    {skill.managerRating}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6 w-[15%] text-center">
                                <span className="text-sm font-medium">{skill.requiredRating}</span>
                              </td>
                              <td className="py-4 px-6 w-[15%]">
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
          </>
        )}
      </CardContent>
    </Card>
  );
}
