'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from '@/components/ui/tooltip';
import { getSkillMatrix } from '@/lib/api';
import { calculateMetricsFromBackendResponse, isSkillsResponse } from '@/lib/type-guards';
import type { SkillMetrics, StaffSkill } from '@/types/staff';
import { Blocks, BrainCircuit, User2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface SkillsData {
  metrics: SkillMetrics;
  skills: StaffSkill[];
}

export default function Overview() {
  const [data, setData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'Technical Skills' | 'Soft Skills'>(
    'Technical Skills',
  );

  useEffect(() => {
    const fetchSkillData = async () => {
      try {
        const response = await getSkillMatrix();
        if (isSkillsResponse(response)) {
          setData({
            metrics: response.metrics,
            skills: response.skills,
          });
        } else {
          const metrics = calculateMetricsFromBackendResponse(response);
          const skills = response.flatMap(item => item.skills);
          setData({
            metrics,
            skills,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load skills data');
      } finally {
        setLoading(false);
      }
    };

    fetchSkillData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  const chartData = data.skills
    .filter(skill => skill.category === selectedCategory)
    .map(skill => ({
      skill: skill.skill,
      average: skill.average,
      requiredRating: skill.requiredRating, // Changed from 'required' to 'requiredRating' to match tooltip
      gap: skill.gap,
    }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">Soft Skills Average</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{data.metrics.softSkillsAverage.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">Technical Skills Average</h3>
            </div>
            <p className="text-2xl font-bold mt-2">
              {data.metrics.technicalSkillsAverage.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Blocks className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm text-muted-foreground">Skills Assessed</h3>
            </div>
            <p className="text-2xl font-bold mt-2">{data.metrics.skillsAssessed}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Skills Overview</CardTitle>
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
          <p className="text-sm text-muted-foreground">
            Your current skill levels compared to required levels
          </p>
        </CardHeader>
        <CardContent>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid gridType="circle" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#666', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Current Level"
                  dataKey="average"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Required Level"
                  dataKey="requiredRating" // Changed from 'required' to 'requiredRating' to match tooltip
                  stroke="#4ade80"
                  fill="#4ade80"
                  fillOpacity={0.3}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
