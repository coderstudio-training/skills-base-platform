'use client';

import { getSkillAnalytics } from '@/lib/api';
import { SkillAnalyticsResponse } from '@/types/api';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export default function AnalysisView() {
  const [analyticsData, setAnalyticsData] = useState<SkillAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getSkillAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analyticsData) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Top Skills</CardTitle>
          <CardDescription>Most prevalent skills across the organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analyticsData.topSkills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(skill.prevalence)}%
                  </span>
                </div>
                <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${skill.prevalence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Skill Gap Analysis</CardTitle>
          <CardDescription>Areas where skill improvement is needed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analyticsData.skillGaps.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{skill.name}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      skill.gap > 1.5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}
                  >
                    Gap: {skill.gap.toFixed(1)}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500 ease-in-out"
                      style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-px bg-black/50"
                      style={{ left: `${(skill.requiredLevel / 5) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current Avg: {skill.currentLevel.toFixed(1)}</span>
                    <span>Required: {skill.requiredLevel.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
