'use client';

import { skillsApi } from '@/lib/api/client';
import { useQuery } from '@/lib/api/hooks';
import { ApiError } from '@/lib/api/types';
import { IBaseTaxonomy } from '@/lib/skills/types';
import React, { Suspense } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

class ErrorBoundary extends React.Component<Props, { hasError: boolean; error: ApiError | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: ApiError) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="text-red-600">Something went ballistic</h3>
          <p className="text-sm text-red-500">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-3 py-1 bg-red-100 rounded"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function SkillsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Technical Taxonomy Dashboard</h1>

      <ErrorBoundary>
        {/* First Suspense wrapper */}
        <Suspense fallback={<div className="h-32 bg-gray-500 animate-pulse rounded" />}>
          <SkillsSummary />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function SkillsSummary() {
  // Using useQuery hook
  const { data, error } = useQuery<IBaseTaxonomy[]>(
    skillsApi,
    '/taxonomy/technical?businessUnit=QA',
    { requiresAuth: true },
  );

  // Throwing error for ErrorBoundary
  if (error) {
    throw error;
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      <div className="p-4 border rounded">
        <h3>Total Taxonomy</h3>
        <p className="text-2xl">{data?.length}</p>
      </div>
      <div className="p-4 border rounded">
        <h3>Title</h3>
        {data?.map(skill => <p key={skill.docId}>{skill.title}</p>)}
      </div>
      <div className="p-4 border rounded">
        <h3>Category</h3>
        {data
          ? Object.entries(
              data?.reduce((acc: { [key: string]: number }, skill) => {
                acc[skill.category] = (acc[skill.category] || 0) + 1;
                return acc;
              }, {}),
            ).map(([category, count]) => (
              <p key={category}>
                {category}: {count}
              </p>
            ))
          : null}
      </div>
    </div>
  );
}
