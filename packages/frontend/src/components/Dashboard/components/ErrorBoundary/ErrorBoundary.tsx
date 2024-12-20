'use client';

import { ApiError } from '@/lib/api/types';
import { Component, ReactNode } from 'react';

interface Props {
  fallback?: ReactNode;
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | ApiError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error | ApiError) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h3 className="text-red-600">Something went wrong</h3>
            <p className="text-sm text-red-500">{this.state.error?.message || 'Unknown error'}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                this.props.onReset?.();
              }}
              className="mt-2 px-3 py-1 bg-red-100 rounded"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
