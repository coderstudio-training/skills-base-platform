'use client';
import { ApiError } from '@/lib/api/types';
import React from 'react';
import { ErrorBoundaryProps } from './types';
import { formatError } from '@/lib/utils';
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, { error: ApiError | null }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: ApiError) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback || (
          <div className="p-4 border border-red-200 rounded">
            <h2 className="text-red-600">Something went wrong!</h2>
            <p className="text-sm text-gray-600">{formatError(this.state.error)}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
