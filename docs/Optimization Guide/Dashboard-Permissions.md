# Dashboard Permissions Implementation Guide

This guide explains how to implement permissions within the Dashboard structure using the existing permissions system from `@lib/api`.

## 1. Using Permissions in Dashboard Components

### Main Dashboard Wrapper

```typescript
// components/Dashboard/index.tsx
import { useAuth } from '@/lib/api/auth';

export function Dashboard({ role, userId, businessUnit = 'ALL' }: DashboardProps) {
  const { user, hasPermission } = useAuth();

  if (!hasPermission('canViewDashboard')) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} role={role} />
      <main className="container mx-auto p-6">
        {role === 'admin' && hasPermission('canManageSystem') && (
          <AdminDashboard />
        )}
        {role === 'manager' && hasPermission('canManageTeam') && (
          <ManagerDashboard userId={userId} />
        )}
        {role === 'staff' && (
          <StaffDashboard userId={userId} />
        )}
      </main>
    </div>
  );
}
```

### Role-Specific Dashboards

#### Admin Dashboard

```typescript
// components/Dashboard/components/Admin/index.tsx
import { useAuth } from '@/lib/api/auth';

export function AdminDashboard({ filters }: AdminDashboardProps) {
  const { hasPermission } = useAuth();
  const { users, skills, analytics } = useAdminData(filters);

  return (
    <div className="space-y-6">
      {hasPermission('canManageUsers') && (
        <UserDirectory users={users} />
      )}
      {hasPermission('canViewSkills') && (
        <SkillsMatrix skills={skills} />
      )}
      {hasPermission('canViewReports') && (
        <Analytics data={analytics} />
      )}
      {hasPermission('canEditAllSkills') && (
        <TSCManager />
      )}
    </div>
  );
}
```

#### Manager Dashboard

```typescript
// components/Dashboard/components/Manager/index.tsx
export function ManagerDashboard({ userId, businessUnit = 'ALL' }: ManagerDashboardProps) {
  const { hasPermission } = useAuth();
  const { team, metrics } = useTeam(userId);
  const { evaluations } = useEvaluation(team?.id);

  return (
    <div className="space-y-6">
      <TeamOverview team={team} metrics={metrics} />
      {hasPermission('canEditTeamSkills') && (
        <SkillsMatrix team={team} />
      )}
      {hasPermission('canViewReports') && (
        <Performance evaluations={evaluations} />
      )}
    </div>
  );
}
```

### TSC Components

#### TSC Manager

```typescript
// components/Dashboard/components/TSC/index.tsx
export function TSCManager({ businessUnit = 'ALL' }: TSCManagerProps) {
  const { hasPermission } = useAuth();
  const {
    tscs,
    error,
    isLoading,
    createTSC,
    updateTSC,
    deleteTSC,
    refetch
  } = useTSCManager(businessUnit);

  if (!hasPermission('canViewSkills')) {
    return <AccessDenied />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>TSC Manager</CardTitle>
        {hasPermission('canEditAllSkills') && (
          <Button onClick={handleCreate}>Create New TSC</Button>
        )}
      </CardHeader>
      <CardContent>
        <TSCList
          tscs={tscs}
          canEdit={hasPermission('canEditAllSkills')}
          onEdit={handleEdit}
          onDelete={deleteTSC}
        />
      </CardContent>
    </Card>
  );
}
```

### Reusable Components

#### Skills Table

```typescript
// components/Dashboard/components/Tables/SkillsTable.tsx
export function SkillsTable({ skills, showManagerRating }: SkillsTableProps) {
  const { hasPermission } = useAuth();
  const canEdit = hasPermission('canEditAllSkills');

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Skill</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Self Rating</TableHead>
          {showManagerRating && <TableHead>Manager Rating</TableHead>}
          {canEdit && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {skills.map((skill) => (
          <TableRow key={skill.id}>
            {/* ... existing cells ... */}
            {canEdit && (
              <TableCell>
                <Button onClick={() => onEdit(skill)}>Edit</Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### Custom Hooks Integration

#### Team Management Hook

```typescript
// components/Dashboard/hooks/useTeam.ts
export function useTeam(managerId: string) {
  const { hasPermission } = useAuth();

  const { data: team } = useQuery(userApi, `/teams/manager/${managerId}`, {
    enabled: hasPermission('canManageTeam'),
    revalidate: 3600,
    tags: ['team'],
  });

  const { data: metrics } = useQuery(skillsApi, `/teams/${team?.id}/metrics`, {
    enabled: !!team?.id && hasPermission('canViewReports'),
    revalidate: 3600,
    tags: ['metrics'],
  });

  return { team, metrics };
}
```

## Permission Patterns

### 1. Component Access Control

```typescript
if (!hasPermission('requiredPermission')) {
  return <AccessDenied />;
}
```

### 2. Conditional Rendering

```typescript
{hasPermission('canEditAllSkills') && <EditButton />}
```

### 3. Data Fetching Control

```typescript
const { data } = useQuery(api, endpoint, {
  enabled: hasPermission('requiredPermission'),
});
```

### 4. Action Authorization

```typescript
const handleAction = () => {
  if (!hasPermission('requiredPermission')) {
    return;
  }
  // Perform action
};
```

## Best Practices

1. Always use the `useAuth` hook from `@lib/api/auth`
2. Check permissions at the component level
3. Control data fetching based on permissions
4. Provide appropriate fallback UI
5. Use type-safe permission strings
6. Follow the established component hierarchy
7. Keep permission logic in parent components
8. Pass down boolean flags to child components

This implementation guide shows how to properly integrate the existing permissions system from `@lib/api` within the Dashboard component structure.
