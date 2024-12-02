# Next.js 14 Project Structure

```
├── app/                         # Next.js 14 app directory (Server Components by default)
│   ├── layout.tsx              # Root layout: Providers, global UI elements
│   ├── page.tsx                # Landing page: Initial entry point
│   ├── error.tsx               # Global error boundary for error handling
│   ├── loading.tsx             # Global loading UI for Suspense
│   ├── not-found.tsx          # Custom 404 page
│   ├── globals.css            # Global styles and CSS reset
│   │
│   └── dashboard/             # Dashboard section
│       ├── layout.tsx         # Dashboard layout: Navigation, sidebar, common UI
│       ├── page.tsx          # Dashboard home: Overview and metrics
│       ├── loading.tsx       # Dashboard-specific loading UI
│       ├── error.tsx         # Dashboard error handling
│       │
│       ├── admin/           # Admin section
│       │   ├── page.tsx     # Admin dashboard: System management
│       │   └── layout.tsx   # Admin-specific layout and navigation
│       │
│       ├── manager/        # Manager section
│       │   ├── page.tsx    # Manager dashboard: Team overview
│       │   └── layout.tsx  # Manager-specific layout
│       │
│       └── staff/         # Staff section
│           ├── page.tsx   # Staff dashboard: Personal overview
│           └── layout.tsx # Staff-specific layout

├── components/            # React components (Client Components)
│   ├── ui/               # shadcn components for consistent UI
│   │   ├── button.tsx   # Reusable button component
│   │   ├── dialog.tsx   # Modal dialog component
│   │   └── ...          # Other UI components
│   │
│   └── Dashboard/        # Dashboard-specific components
│       ├── types.ts      # TypeScript interfaces for dashboard
│       ├── constants.ts  # Dashboard constants and config
│       │
│       ├── components/   # Feature-specific components
│       │   ├── Header/   # Dashboard header components
│       │   │   ├── index.tsx            # Main header wrapper
│       │   │   ├── UserMenu.tsx         # User profile and settings
│       │   │   └── NotificationCenter.tsx # Notifications UI
│       │   │
│       │   ├── Manager/  # Manager dashboard components
│       │   │   ├── index.tsx        # Manager dashboard wrapper
│       │   │   ├── TeamOverview.tsx # Team performance overview
│       │   │   ├── Performance.tsx  # Performance metrics
│       │   │   └── Evaluation.tsx   # Team evaluation tools
│       │   │
│       │   ├── Staff/   # Staff dashboard components
│       │   │   ├── index.tsx        # Staff dashboard wrapper
│       │   │   ├── SkillsOverview.tsx # Skills assessment view
│       │   │   ├── GrowthPlan.tsx    # Career development plan
│       │   │   └── Training.tsx      # Training progress
│       │   │
│       │   ├── Admin/   # Admin dashboard components
│       │   │   ├── index.tsx        # Admin dashboard wrapper
│       │   │   ├── UserDirectory.tsx # User management
│       │   │   ├── SkillsMatrix.tsx # Skills framework
│       │   │   └── Analytics.tsx    # System analytics
│       │   │
│       │   ├── TSC/     # Technical Skills Component
│       │   │   ├── index.tsx      # TSC main component
│       │   │   ├── components/    # TSC sub-components
│       │   │   │   ├── TSCList/   # TSC listing components
│       │   │   │   │   ├── index.tsx   # List wrapper
│       │   │   │   │   ├── TSCItem.tsx # Individual TSC
│       │   │   │   │   └── ProficiencyTable.tsx # Skill levels
│       │   │   │   └── TSCForm/   # TSC management
│       │   │   │       ├── index.tsx   # Form wrapper
│       │   │   │       └── validation.ts # Form validation
│       │   │   └── types.ts      # TSC-specific types
│       │   │
│       │   ├── Charts/  # Data visualization
│       │   │   ├── BarChart.tsx    # Bar chart component
│       │   │   ├── RadarChart.tsx  # Skills radar chart
│       │   │   ├── PieChart.tsx    # Distribution charts
│       │   │   └── LineChart.tsx   # Trend analysis
│       │   │
│       │   ├── Cards/   # Information cards
│       │   │   ├── MetricCard.tsx     # KPI display
│       │   │   ├── PerformanceCard.tsx # Performance metrics
│       │   │   ├── SkillCard.tsx      # Skill information
│       │   │   ├── TeamCard.tsx       # Team overview
│       │   │   └── TrainingCard.tsx   # Training status
│       │   │
│       │   ├── Tables/  # Data tables
│       │   │   ├── SkillsTable.tsx    # Skills matrix
│       │   │   ├── TeamTable.tsx      # Team roster
│       │   │   └── TrainingTable.tsx  # Training records
│       │   │
│       │   └── Dialogs/ # Modal dialogs
│       │       ├── CourseDialog.tsx   # Course details
│       │       ├── SkillDialog.tsx    # Skill editing
│       │       └── EvaluationDialog.tsx # Performance review
│       │
│       └── hooks/      # Custom React hooks
│           ├── useDashboard.ts     # Dashboard state management
│           ├── useCharts.ts        # Chart data handling
│           ├── useMetrics.ts       # Metrics calculations
│           ├── useTeam.ts          # Team data management
│           ├── useSkills.ts        # Skills tracking
│           ├── useEvaluation.ts    # Evaluation logic
│           └── useTSCManager.ts    # TSC state management

├── lib/                # Utility functions and shared code
│   ├── api/           # API implementation (preserved)
│   │   ├── README.md  # API documentation
│   │   ├── auth.ts    # Authentication logic
│   │   ├── client.ts  # API client implementation
│   │   ├── config.ts  # API configuration
│   │   ├── example.tsx # Usage examples
│   │   ├── hooks.ts   # Data fetching hooks
│   │   └── types.ts   # API type definitions
│   │
│   └── utils/         # Utility functions
│       ├── date.ts    # Date formatting and manipulation
│       └── validation.ts # Input validation helpers
```

# Implementation Examples

## Server Component Example (app/dashboard/admin/page.tsx)

```typescript
import { Suspense } from 'react';
import { AdminDashboard } from '@/components/Dashboard/components/Admin';
import { userApi, fetchServerData } from '@/lib/api';
import type { User } from '@/lib/api/types';

/**
 * Admin Dashboard Page (Server Component)
 *
 * Features:
 * - Server-side data fetching for initial state
 * - Suspense boundary for loading states
 * - Type-safe data handling
 * - Revalidation control
 * - Cache tag management
 */
export default async function AdminDashboardPage() {
  // Fetch initial data on the server with caching strategy
  const { data: adminData } = await fetchServerData<User>(
    userApi,
    '/users/admin-data',
    {
      revalidate: 3600, // Cache for 1 hour
      tags: ['admin-dashboard'], // For cache invalidation
    }
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard initialData={adminData} />
    </Suspense>
  );
}
```

## Client Component Example (components/Dashboard/components/Admin/index.tsx)

```typescript
'use client';

import { useQuery } from '@/lib/api/hooks';
import { skillsApi } from '@/lib/api/client';
import { useAuth } from '@/lib/api/auth';
import type { Skill } from '@/lib/api/types';

interface AdminDashboardProps {
  initialData: any; // Type from server component
}

/**
 * Admin Dashboard Component (Client Component)
 *
 * Features:
 * - Client-side data fetching
 * - Role-based access control
 * - Real-time updates
 * - Type-safe API integration
 * - Permission-based rendering
 */
export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const { hasPermission } = useAuth();

  // Client-side data fetching with permissions check
  const { data: skills } = useQuery<Skill[]>(
    skillsApi,
    '/skills',
    {
      enabled: hasPermission('canViewSkills'),
      revalidate: 300, // Revalidate every 5 minutes
    }
  );

  // Permission-based rendering
  if (!hasPermission('canAccessAdminDashboard')) {
    return <div>Access Denied</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* Initial server-fetched data */}
      <section className="mb-6">
        {/* Admin overview using initialData */}
      </section>

      {/* Client-side fetched data */}
      <section className="mb-6">
        {/* Skills management using skills data */}
      </section>

      {/* Role-based UI elements */}
      {hasPermission('canManageUsers') && (
        <section className="mb-6">
          {/* User management UI */}
        </section>
      )}
    </div>
  );
}
```

## Layout Example (app/dashboard/layout.tsx)

```typescript
import { Header } from '@/components/Dashboard/components/Header';
import { Providers } from '@/components/Providers';

/**
 * Dashboard Layout
 *
 * Features:
 * - Persistent navigation
 * - Auth provider
 * - Error boundaries
 * - Loading states
 * - Common UI elements
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </Providers>
  );
}
```

## Integration Benefits

1. Server Components

   - Zero client-side JavaScript for non-interactive content
   - Automatic data fetching optimization
   - Built-in SEO optimization
   - Reduced client bundle size
   - Server-side error handling

2. Client Components

   - Rich interactivity where needed
   - Real-time updates and mutations
   - Client-side state management
   - Optimistic updates
   - Form handling

3. Data Fetching Strategy

   - Server-side initial data fetch
   - Client-side updates and mutations
   - Intelligent caching with revalidation
   - Type-safe API calls
   - Error boundary integration

4. Authentication & Authorization

   - Role-based access control
   - Permission-based UI rendering
   - Protected routes
   - Secure data handling
   - Type-safe auth hooks

5. Performance Optimizations
   - Automatic code splitting
   - Route-based chunking
   - Optimized loading states
   - Streaming server rendering
   - Progressive enhancement

## Development Workflow

1. Page Creation

   ```typescript
   // 1. Create route in app directory
   // 2. Add server component with data fetching
   // 3. Create corresponding client components
   // 4. Implement layout if needed
   // 5. Add error and loading states
   ```

2. Component Development

   ```typescript
   // 1. Define component interface
   // 2. Implement server or client component
   // 3. Add data fetching if needed
   // 4. Implement permission checks
   // 5. Add error handling
   ```

3. API Integration
   ```typescript
   // 1. Use existing API utilities
   // 2. Implement type-safe data fetching
   // 3. Add caching strategy
   // 4. Handle loading and error states
   // 5. Implement optimistic updates
   ```

This structure provides:

- Clear separation of concerns
- Type safety throughout
- Efficient data fetching
- Scalable component organization
- Maintainable codebase
- Optimal performance
- Secure authentication
- Role-based access control

## Research Topics for Developers

1. Next.js 14 App Router Implementation

   - Understanding Server Components vs Client Components in our dashboard structure
   - Implementing layouts for different dashboard sections (admin, manager, staff)
   - Using route groups and dynamic routes effectively
   - Handling loading and error states in the app directory

2. API Integration with Next.js 14

   - Using our existing API utilities with Server Components
   - Implementing optimistic updates in dashboard components
   - Managing server state with our custom hooks
   - Handling real-time updates in dashboard views

3. Authentication and Authorization

   - Implementing our role-based access control with Next.js middleware
   - Managing auth state across Server and Client Components
   - Protecting dashboard routes based on user roles
   - Handling token refresh and session management

4. Dashboard Performance

   - Optimizing Server Components in admin, manager, and staff views
   - Implementing efficient data fetching patterns
   - Managing component-level caching strategies
   - Handling large datasets in tables and charts

5. Component Architecture
   - Building reusable dashboard components
   - Managing shared state between components
   - Implementing type-safe props and events
   - Creating maintainable component hierarchies

Key Resources:

- Next.js App Router: https://nextjs.org/docs/app
- React Server Components: https://nextjs.org/docs/app/building-your-application/rendering
- Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
- Authentication: https://nextjs.org/docs/app/building-your-application/authentication
