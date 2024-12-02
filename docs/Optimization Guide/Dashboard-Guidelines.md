# Dashboard Components Refactoring Guidelines

This document provides guidelines for refactoring the dashboard components (Admin, Manager, Staff) to utilize the @lib/api module and create reusable components.

## 1. Directory Structure

```
components/
  Dashboard/
    index.tsx               # Main Dashboard wrapper component
    types.ts               # Shared dashboard types
    constants.ts           # Shared dashboard constants
    components/
      Header/
        index.tsx         # Shared header component
        UserMenu.tsx      # User menu component
        NotificationCenter.tsx # Notifications component
      Manager/
        index.tsx        # Manager dashboard
        TeamOverview.tsx # Team overview component
        Performance.tsx  # Performance tracking
        Evaluation.tsx   # Team evaluation
      Staff/
        index.tsx       # Staff dashboard
        SkillsOverview.tsx # Personal skills view
        GrowthPlan.tsx    # Growth planning
        Training.tsx      # Training view
      Admin/
        index.tsx      # Admin dashboard
        UserDirectory.tsx # User management
        SkillsMatrix.tsx # Skills management
        Analytics.tsx    # Analytics view
      TSC/
        index.tsx      # TSC Manager component
        components/
          TSCList/
            index.tsx   # TSC list component
            TSCItem.tsx # Individual TSC item
            ProficiencyTable.tsx # Proficiency display
          TSCForm/
            index.tsx   # TSC form component
            validation.ts # Form validation logic
      Charts/
        BarChart.tsx    # Reusable bar chart
        RadarChart.tsx  # Reusable radar chart
        PieChart.tsx    # Reusable pie chart
        LineChart.tsx   # Reusable line chart
      Cards/
        MetricCard.tsx     # Basic metric card
        PerformanceCard.tsx # Performance metrics card
        SkillCard.tsx      # Skill display card
        TeamCard.tsx       # Team info card
        TrainingCard.tsx   # Training course card
      Tables/
        SkillsTable.tsx    # Skills matrix table
        TeamTable.tsx      # Team members table
        TrainingTable.tsx  # Training courses table
      Dialogs/
        CourseDialog.tsx   # Course details dialog
        SkillDialog.tsx    # Skill details dialog
        EvaluationDialog.tsx # Evaluation form dialog
    hooks/
      useDashboard.ts     # Shared dashboard logic
      useCharts.ts        # Chart data management
      useMetrics.ts       # Metrics calculation
      useTeam.ts          # Team management
      useSkills.ts        # Skills management
      useEvaluation.ts    # Evaluation handling
      useTSCManager.ts    # TSC management logic
```

## 2. Core Components

### 2.1 Dashboard Wrapper

```typescript
// components/Dashboard/index.tsx
interface DashboardProps {
  role: 'admin' | 'manager' | 'staff';
  userId: string;
  businessUnit?: BusinessUnit;
}

export function Dashboard({ role, userId, businessUnit = 'ALL' }: DashboardProps) {
  const { user, permissions } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} role={role} />
      <main className="container mx-auto p-6">
        {role === 'admin' && <AdminDashboard />}
        {role === 'manager' && <ManagerDashboard userId={userId} />}
        {role === 'staff' && <StaffDashboard userId={userId} />}
      </main>
    </div>
  );
}
```

### 2.2 Header Component

```typescript
// components/Dashboard/components/Header/index.tsx
interface HeaderProps {
  user: User;
  role: 'admin' | 'manager' | 'staff';
  onAction?: (action: string) => void;
}

export function Header({ user, role, onAction }: HeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <UserMenu user={user} role={role} />
        </div>
        <div className="flex items-center space-x-4">
          <NotificationCenter userId={user.id} />
          {onAction && (
            <Button variant="ghost" onClick={() => onAction('settings')}>
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
```

### 2.3 Role-Specific Dashboards

#### Manager Dashboard

```typescript
// components/Dashboard/components/Manager/index.tsx
interface ManagerDashboardProps {
  userId: string;
  businessUnit?: BusinessUnit;
}

export function ManagerDashboard({ userId, businessUnit = 'ALL' }: ManagerDashboardProps) {
  const { team, metrics } = useTeam(userId);
  const { evaluations } = useEvaluation(team?.id);

  return (
    <div className="space-y-6">
      <TeamOverview team={team} metrics={metrics} />
      <Performance evaluations={evaluations} />
      <SkillsMatrix team={team} />
    </div>
  );
}
```

#### Staff Dashboard

```typescript
// components/Dashboard/components/Staff/index.tsx
interface StaffDashboardProps {
  userId: string;
}

export function StaffDashboard({ userId }: StaffDashboardProps) {
  const { skills, growth } = useSkills(userId);
  const { courses } = useTraining(userId);

  return (
    <div className="space-y-6">
      <SkillsOverview skills={skills} />
      <GrowthPlan plan={growth} />
      <Training courses={courses} />
    </div>
  );
}
```

#### Admin Dashboard

```typescript
// components/Dashboard/components/Admin/index.tsx
interface AdminDashboardProps {
  filters?: DashboardFilters;
}

export function AdminDashboard({ filters }: AdminDashboardProps) {
  const { users, skills, analytics } = useAdminData(filters);

  return (
    <div className="space-y-6">
      <UserDirectory users={users} />
      <SkillsMatrix skills={skills} />
      <Analytics data={analytics} />
      <TSCManager />
    </div>
  );
}
```

## 3. TSC Management

### 3.1 TSC Manager Component

```typescript
// components/Dashboard/components/TSC/index.tsx
interface TSCManagerProps {
  businessUnit?: BusinessUnit;
}

export function TSCManager({ businessUnit = 'ALL' }: TSCManagerProps) {
  const { hasPermission } = useAuth();
  const [editingTSC, setEditingTSC] = useState<TSC | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    tscs,
    error,
    isLoading,
    createTSC,
    updateTSC,
    deleteTSC,
    refetch
  } = useTSCManager(businessUnit);

  const handleCreate = () => {
    setEditingTSC(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (tsc: TSC) => {
    setEditingTSC(tsc);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: TSCFormData) => {
    try {
      if (editingTSC) {
        await updateTSC({ ...data, id: editingTSC.id });
      } else {
        await createTSC(data);
      }
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to save TSC:', error);
    }
  };

  if (!hasPermission('canViewSkills')) {
    return <div>You don't have permission to view this page.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          TSC Manager
          {businessUnit !== 'ALL' && ` - ${BUSINESS_UNITS[businessUnit]}`}
        </CardTitle>
        {hasPermission('canEditAllSkills') && (
          <Button onClick={handleCreate} disabled={businessUnit === 'ALL'}>
            Create New TSC
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <TSCList
          tscs={tscs}
          onEdit={handleEdit}
          onDelete={deleteTSC}
        />
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <TSCForm
            tsc={editingTSC}
            businessUnit={businessUnit}
            onSave={handleSave}
            onCancel={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </CardContent>
    </Card>
  );
}
```

### 3.2 TSC List Component

```typescript
// components/Dashboard/components/TSC/components/TSCList/index.tsx
interface TSCListProps {
  tscs: TSC[];
  onEdit: (tsc: TSC) => void;
  onDelete: (id: string) => void;
}

export function TSCList({ tscs, onEdit, onDelete }: TSCListProps) {
  return (
    <div className="space-y-4">
      {tscs.map((tsc) => (
        <TSCItem
          key={tsc.id}
          tsc={tsc}
          onEdit={() => onEdit(tsc)}
          onDelete={() => onDelete(tsc.id)}
        />
      ))}
    </div>
  );
}
```

### 3.3 TSC Form Component

```typescript
// components/Dashboard/components/TSC/components/TSCForm/index.tsx
interface TSCFormProps {
  tsc?: TSC | null;
  businessUnit: BusinessUnit;
  onSave: (data: TSCFormData) => void;
  onCancel: () => void;
}

export function TSCForm({ tsc, businessUnit, onSave, onCancel }: TSCFormProps) {
  const [formData, setFormData] = useState<TSCFormData>(
    tsc || {
      businessUnit,
      category: '',
      title: '',
      description: '',
      proficiencies: [],
      rangeOfApplication: []
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateTSCForm(formData)) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form fields */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {tsc ? 'Update' : 'Create'} TSC
        </Button>
      </div>
    </form>
  );
}
```

## 4. Reusable Components

### 4.1 Chart Components

```typescript
// components/Dashboard/components/Charts/BarChart.tsx
interface BarChartProps<T> {
  data: T[];
  xKey: keyof T;
  yKey: keyof T;
  title?: string;
  height?: number;
  stacked?: boolean;
  showLegend?: boolean;
}

export function BarChart<T>({
  data,
  xKey,
  yKey,
  title,
  height = 300,
  stacked = false,
  showLegend = true
}: BarChartProps<T>) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={String(xKey)} />
        <YAxis />
        {showLegend && <Legend />}
        <Tooltip />
        <Bar
          dataKey={String(yKey)}
          fill="#8884d8"
          stackId={stacked ? "stack" : undefined}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

### 4.2 Card Components

```typescript
// components/Dashboard/components/Cards/MetricCard.tsx
interface MetricCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  description?: string;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  description
}: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center space-x-2">
            {trend.direction === 'up' ? (
              <TrendingUp className="text-green-500" />
            ) : (
              <TrendingDown className="text-red-500" />
            )}
            <span className={trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}>
              {trend.value}%
            </span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

### 4.3 Table Components

```typescript
// components/Dashboard/components/Tables/SkillsTable.tsx
interface SkillsTableProps {
  skills: Skill[];
  showActions?: boolean;
  onEdit?: (skill: Skill) => void;
  showManagerRating?: boolean;
}

export function SkillsTable({
  skills,
  showActions,
  onEdit,
  showManagerRating
}: SkillsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Skill</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Self Rating</TableHead>
          {showManagerRating && <TableHead>Manager Rating</TableHead>}
          <TableHead>Required Level</TableHead>
          {showActions && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {skills.map((skill) => (
          <TableRow key={skill.id}>
            <TableCell>{skill.name}</TableCell>
            <TableCell>{skill.category}</TableCell>
            <TableCell>
              <Progress value={skill.selfRating * 20} className="w-[60px]" />
            </TableCell>
            {showManagerRating && (
              <TableCell>
                <Progress value={skill.managerRating * 20} className="w-[60px]" />
              </TableCell>
            )}
            <TableCell>
              <Progress value={skill.requiredRating * 20} className="w-[60px]" />
            </TableCell>
            {showActions && onEdit && (
              <TableCell>
                <Button variant="ghost" onClick={() => onEdit(skill)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

## 5. Custom Hooks

### 5.1 Dashboard Hooks

```typescript
// components/Dashboard/hooks/useDashboard.ts
export function useDashboard(userId: string) {
  const { data: user } = useQuery(userApi, `/users/${userId}`, {
    revalidate: 3600,
    tags: ['user'],
  });

  const { data: permissions } = useQuery(userApi, `/users/${userId}/permissions`, {
    revalidate: 3600,
    tags: ['permissions'],
  });

  return { user, permissions };
}
```

### 5.2 Team Hooks

```typescript
// components/Dashboard/hooks/useTeam.ts
export function useTeam(managerId: string) {
  const { data: team } = useQuery(userApi, `/teams/manager/${managerId}`, {
    revalidate: 3600,
    tags: ['team'],
  });

  const { data: metrics } = useQuery(skillsApi, `/teams/${team?.id}/metrics`, {
    enabled: !!team?.id,
    revalidate: 3600,
    tags: ['metrics'],
  });

  return { team, metrics };
}
```

### 5.3 TSC Manager Hook

```typescript
// components/Dashboard/hooks/useTSCManager.ts
export function useTSCManager(businessUnit: BusinessUnit) {
  const { hasPermission } = useAuth();

  const {
    data: tscs,
    error,
    isLoading,
    refetch,
  } = useQuery<TSC[]>(skillsApi, '/tscs', {
    enabled: hasPermission('canViewSkills'),
    revalidate: 3600,
    tags: ['tscs'],
  });

  const { mutate: createTSC, isLoading: isCreating } = useMutation<TSC, TSCFormData>(
    skillsApi,
    '/tscs',
    'POST',
  );

  const { mutate: updateTSC, isLoading: isUpdating } = useMutation<TSC, Partial<TSC>>(
    skillsApi,
    '/tscs',
    'PUT',
  );

  const { mutate: deleteTSC, isLoading: isDeleting } = useMutation<void, string>(
    skillsApi,
    '/tscs',
    'DELETE',
  );

  return {
    tscs: tscs?.filter(tsc => (businessUnit === 'ALL' ? true : tsc.businessUnit === businessUnit)),
    error,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    createTSC,
    updateTSC,
    deleteTSC,
    refetch,
  };
}
```

## 6. Type Definitions

### 6.1 Core Types

```typescript
// components/Dashboard/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  department: string;
  teamId?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  selfRating: number;
  managerRating?: number;
  requiredRating: number;
  gap?: number;
  description?: string;
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  members: TeamMember[];
  metrics?: TeamMetrics;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  skills: Skill[];
  performance?: number;
}

export interface TeamMetrics {
  averagePerformance: number;
  skillGrowth: number;
  trainingCompletion: number;
}

export interface TrainingCourse {
  id: string;
  name: string;
  skillId: string;
  level: 'basic' | 'intermediate' | 'advanced';
  duration: string;
  format: string;
  provider: string;
  description: string;
  prerequisites?: string[];
}

export interface Evaluation {
  id: string;
  userId: string;
  skillId: string;
  rating: number;
  feedback: string;
  evaluatedBy: string;
  timestamp: string;
}

export interface DashboardFilters {
  department?: string;
  skillCategory?: string;
  timeRange?: string;
  status?: string;
}
```

### 6.2 TSC Types

```typescript
// components/Dashboard/components/TSC/types.ts
export interface TSCProficiency {
  level: string;
  code: string;
  description: string;
  knowledge: string[];
  abilities: string[];
}

export interface TSC {
  id: string;
  businessUnit: BusinessUnit;
  category: string;
  title: string;
  description: string;
  proficiencies: TSCProficiency[];
  rangeOfApplication: string[];
  createdAt: string;
  updatedAt: string;
}

export type TSCFormData = Omit<TSC, 'id' | 'createdAt' | 'updatedAt'>;
```

## 7. Error Handling

### 7.1 Error Components

```typescript
// components/Dashboard/components/ErrorDisplay.tsx
interface ErrorDisplayProps {
  error: ApiError;
  onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="rounded-lg border border-destructive/50 p-4">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5 text-destructive" />
        <h3 className="font-semibold text-destructive">
          Error: {error.code}
        </h3>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-4"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
```

### 7.2 Error Boundaries

```typescript
// components/Dashboard/components/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  { hasError: boolean }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4">
          <h2>Something went wrong.</h2>
          <Button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 8. Security Guidelines

### 8.1 Permission Checking

```typescript
// components/Dashboard/utils/permissions.ts
export function checkPermission(
  requiredPermission: Permission,
  userPermissions: Permission[]
): boolean {
  return userPermissions.includes(requiredPermission);
}

export function withPermission<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  requiredPermission: Permission
) {
  return function WithPermissionComponent(props: T) {
    const { permissions } = useAuth();

    if (!checkPermission(requiredPermission, permissions)) {
      return <div>You don't have permission to view this content.</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
```

### 8.2 Input Validation

```typescript
// components/Dashboard/utils/validation.ts
export function validateSkillData(data: Partial<Skill>): boolean {
  if (!data.name?.trim()) return false;
  if (!data.category?.trim()) return false;
  if (typeof data.selfRating !== 'number') return false;
  if (data.selfRating < 0 || data.selfRating > 5) return false;
  if (typeof data.requiredRating !== 'number') return false;
  if (data.requiredRating < 0 || data.requiredRating > 5) return false;
  return true;
}

export function validateTSCData(data: Partial<TSC>): boolean {
  if (!data.title?.trim()) return false;
  if (!data.category?.trim()) return false;
  if (!data.description?.trim()) return false;
  if (!Array.isArray(data.proficiencies)) return false;
  if (data.proficiencies.length === 0) return false;
  return true;
}
```

## 9. Performance Guidelines

### 9.1 Memoization

```typescript
// components/Dashboard/components/Charts/MemoizedChart.tsx
export const MemoizedBarChart = React.memo(BarChart, (prev, next) => {
  return prev.data === next.data && prev.xKey === next.xKey && prev.yKey === next.yKey;
});

// components/Dashboard/components/Tables/MemoizedTable.tsx
export const MemoizedSkillsTable = React.memo(SkillsTable, (prev, next) => {
  return (
    prev.skills === next.skills &&
    prev.showActions === next.showActions &&
    prev.showManagerRating === next.showManagerRating
  );
});
```

### 9.2 Data Fetching Optimization

```typescript
// components/Dashboard/hooks/useOptimizedQuery.ts
export function useOptimizedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    retry?: boolean | number;
  },
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch data
    queryClient.prefetchQuery(key, queryFn);

    return () => {
      // Cleanup stale data
      queryClient.removeQueries(key, { exact: true });
    };
  }, [key, queryFn, queryClient]);

  return useQuery(key, queryFn, {
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    cacheTime: options.cacheTime || 30 * 60 * 1000, // 30 minutes
    retry: options.retry ?? 3,
  });
}
```

## 10. Implementation Steps

1. Set up directory structure

   - Create all necessary folders and files
   - Organize components logically

2. Implement core components

   - Create Dashboard wrapper
   - Implement Header
   - Build role-specific dashboards

3. Add TSC management

   - Implement TSC Manager
   - Create TSC List and Form
   - Add TSC-specific hooks

4. Create reusable components

   - Build chart components
   - Implement card components
   - Create table components

5. Set up data management

   - Implement custom hooks
   - Add API integration
   - Set up caching

6. Add security measures

   - Implement permission checking
   - Add input validation
   - Set up error boundaries

7. Optimize performance

   - Add memoization
   - Optimize data fetching
   - Implement code splitting

8. Add error handling

   - Create error components
   - Implement error boundaries
   - Add error logging

9. Test implementation

   - Unit test components
   - Integration test features
   - Performance testing

10. Documentation
    - Add component documentation
    - Document API integration
    - Create usage examples

## 11. Best Practices

1. Component Development

   - Use TypeScript for all components
   - Follow component composition patterns
   - Implement proper prop validation
   - Use proper naming conventions

2. State Management

   - Use appropriate state management tools
   - Implement proper caching
   - Handle loading states
   - Manage side effects

3. Security

   - Always validate input
   - Implement proper authentication
   - Use proper authorization
   - Handle sensitive data appropriately

4. Performance

   - Optimize component rendering
   - Implement proper caching
   - Use code splitting
   - Optimize bundle size

5. Testing

   - Write unit tests
   - Implement integration tests
   - Add performance tests
   - Test error scenarios

6. Documentation
   - Document components
   - Add usage examples
   - Document API integration
   - Maintain changelog

## 12. Benefits

1. Code Organization

   - Clear directory structure
   - Logical component grouping
   - Easy to navigate
   - Easy to maintain

2. Reusability

   - Shared components
   - Common patterns
   - Consistent behavior
   - Reduced duplication

3. Maintainability

   - Clear patterns
   - Easy to update
   - Easy to test
   - Well documented

4. Security

   - Proper authentication
   - Role-based access
   - Input validation
   - Error handling

5. Performance
   - Optimized rendering
   - Efficient data fetching
   - Proper caching
   - Code splitting

This comprehensive implementation provides a solid foundation for building and maintaining a production-grade dashboard system that is secure, performant, and maintainable.
