'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDistributions, getSkillAnalytics } from '@/lib/api';
import {
  BusinessUnitSkillDistribution,
  GradeDistributionItem,
  SkillDistributionCategory,
  SkillDistributionItem,
} from '@/types/admin';
import { DistributionResponse, SkillAnalyticsResponse } from '@/types/api';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LimitedItems<T> {
  displayed: T[];
  remaining: number;
}

const StatusIcon = ({ status }: { status: 'warning' | 'critical' | 'normal' }) => {
  switch (status) {
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case 'normal':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    default:
      return null;
  }
};

const SkillItem = ({ skill }: { skill: SkillDistributionItem }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-900">{skill.name}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
        {skill.userCount} {skill.userCount === 1 ? 'user' : 'users'}
      </span>
      <StatusIcon status={skill.status} />
    </div>
  </div>
);

export default function AnalysisView() {
  const [analyticsData, setAnalyticsData] = useState<SkillAnalyticsResponse | null>(null);
  const [distributionData, setDistributionData] = useState<DistributionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analytics, distributions] = await Promise.all([
          getSkillAnalytics(),
          getDistributions(),
        ]);
        setAnalyticsData(analytics);
        setDistributionData(distributions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  function getLimitedItems<T>(items: T[], limit = 3): LimitedItems<T> {
    return {
      displayed: items.slice(0, limit),
      remaining: Math.max(0, items.length - limit),
    };
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!analyticsData || !distributionData) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Skill Distribution</CardTitle>
          <CardDescription>Skill coverage across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 max-h-[400px] overflow-y-auto">
            {' '}
            {/* Added max height and scroll */}
            {distributionData.skillDistribution.map(
              (businessUnit: BusinessUnitSkillDistribution, buIndex: number) => (
                <div key={buIndex} className="space-y-4">
                  <h2 className="text-lg font-bold text-primary">{businessUnit.businessUnit}</h2>
                  {businessUnit.categories.map(
                    (category: SkillDistributionCategory, categoryIndex: number) => {
                      const { displayed: displayedSkills, remaining } = getLimitedItems(
                        category.skills,
                      );

                      return (
                        <div key={categoryIndex} className="space-y-2">
                          <h3 className="font-semibold text-base text-muted-foreground">
                            {category.category}
                          </h3>
                          <div className="space-y-2">
                            {displayedSkills.map(
                              (skill: SkillDistributionItem, skillIndex: number) => (
                                <SkillItem key={skillIndex} skill={skill} />
                              ),
                            )}
                            {remaining > 0 && (
                              <div className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                                And {remaining} more...
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
          <CardDescription>Employee distribution by grade level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {distributionData.gradeDistribution.map(
              (grade: GradeDistributionItem, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{grade.grade}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {grade.userCount} {grade.userCount === 1 ? 'user' : 'users'}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>

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
