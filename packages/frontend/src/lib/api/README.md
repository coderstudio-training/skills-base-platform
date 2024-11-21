# Next.js 14 Data Fetching Library

A type-safe, reusable data fetching library for Next.js 14 microservices architecture that handles server/client components, caching, errors, and authentication with RBAC.

## Features

[X] 🔒 Authentication with Google OAuth and Admin Basic Auth
[X] 👥 Role-Based Access Control (RBAC)
[X] 🎯 Type-safe API calls
[X] 🔄 Request retrying
[ ] 💾 Server-side caching with revalidation
[X] ⚡ React Server Components support
[X]🎣 React hooks for client components
[X]⚠️ Comprehensive error handling
[ ]🔍 Request/response interceptors

## Authentication

The library supports two authentication methods:

### 1. Google OAuth (for Staff and Managers)

```typescript
// In your login component
await signIn('google', { callbackUrl: '/api/auth/callback/google' });
```

### 2. Basic Auth (for Admins)

```typescript
const { loginAsAdmin } = useAuth();

// In your admin login component
await mutate({ email, password });
```

## Role-Based Access Control

The library implements RBAC with three roles:

### 1. Staff

- Can view and edit their own skills
- Can view learning resources
- Can access dashboard

### 2. Manager

- All Staff permissions
- Can view and edit team skills
- Can manage team
- Can view reports

### 3. Admin

- All Manager permissions
- Can manage system
- Can manage all users
- Can access admin panel

### Get Roles

```typescript
const { getRoles } = useAuth();
```

### Using Permissions

```typescript
const { hasPermission } = useAuth();

// Check permission before rendering
if (hasPermission('canEditAllSkills')) {
  // Render admin controls
}

// Or use in conditional rendering
{hasPermission('canManageTeam') && <TeamManagement />}
```

### Route Protection

```typescript
const { canAccessRoute } = useAuth();

// Check if user can access route
if (canAccessRoute('/admin/settings')) {
  // Allow access
}
```

### 1. Server Components with Auth

serverSideIntercept function checks existing session and token expiry,
as well as optional checks for permission and routes.

```typescript
// In your Server Component
import { serverSideIntercept } from '@/lib/api/auth';

export default async function ProfilePage() {
  await serverSideIntercept({ permission: 'canAccessOwnSkills', route: 'profile'})

  const { data, error } = await getUserProfile(
    {
      tags: ['users'],
      revalidate: 100
    });

  if (error) {
    return (
      <div>
        formatErorr(error);
      </div>
    )
  }

  return <h1>Welcome, {data.name}</h1>;
}
```

### 2. Client Components with RBAC

```typescript
'use client';

export default function ShowcaseDashboard() {
  const { hasPermission, user } = useAuth();

  const {
    data: taxonomy_data,
    error: queryError,
    isLoading: queryLoading,
  } = useQuery<Taxonomy>(
    skillsApi,
    '/taxonomy/1yMsFZfwyumL4W7Erc0hr1IfM8_DsErcdri0TBEJRjq0?businessUnit=QA',
    {
      requiresAuth: true,
      cacheStrategy: 'default',
      revalidate: 300,
    },
  );

  return (
    <div>
        <Tabs defaultValue="taxonomy">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
          </TabsList>
          <TabsContent value="taxonomy">
            <Card>
              <CardHeader>
                <CardTitle>Taxonomy</CardTitle>
                <CardDescription>List of technical skills and descriptions</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {queryLoading ? (
                    <li>Loading...</li>
                  ) : queryError ? (
                    <li>Error: {queryError.message}</li>
                  ) : (
                    <li key={taxonomy_data?.docId} className="border-b pb-4">
                      <h3 className="text-lg font-semibold">{taxonomy_data?.title}</h3>
                      <p className="text-sm text-gray-600">{taxonomy_data?.description}</p>
                      <p className="text-sm font-semibold mt-2">
                        Category: {taxonomy_data?.category}
                      </p>
                      <div className="mt-2">
                        <h4 className="font-semibold">Proficiency Description:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data?.proficiencyDescription || {}).map(
                            ([key, value]) => (
                              <li key={key}>
                                <strong>{key}:</strong> {JSON.stringify(value)}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-semibold">Abilities:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data?.abilities || {}).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-2">
                        <h4 className="font-semibold">Knowledge:</h4>
                        <ul className="pl-4 list-disc">
                          {Object.entries(taxonomy_data?.knowledge || {}).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}:</strong> {JSON.stringify(value)}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {taxonomy_data?.rangeOfApplication && (
                        <div className="mt-2">
                          <h4 className="font-semibold">Range of Application:</h4>
                          <ul className="pl-4 list-disc">
                            {taxonomy_data.rangeOfApplication.map((application, index) => (
                              <li key={index}>{application}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  )
}
```

### 3. Protected Mutations

```typescript
'use client';

export default function AddTaxonomyForm
  const {
      mutate,
      error: mutateError,
      isLoading: mutateLoading,
    } = useMutation<ITaxonomyResponse, ITaxonomy>(skillsApi, '/taxonomy/bulk-upsert', 'POST', {
      requiresAuth: true,
    });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const taxonomyData: ITaxonomy = {
      data: [
        {
          docTitle,
          docId,
          docRevisionId,
          category,
          title,
          description,
          proficiencyDescription: {
            'level 1': [proficiencyDescription],
          },
          abilities: {
            'level 1': [abilities],
          },
          knowledge: {
            'level 1': [knowledge],
          },
          rangeOfApplication: [rangeOfApplication],
          businessUnit,
        },
      ],
    };

    const response = await mutate(taxonomyData);

    if (response.error && mutateError) {
      console.error('Error submitting taxonomy data:', response.error);
      alert(`Error: ${response.error.message} || ${formatError(mutateError)}`);
    } else if (response.data) {
      console.log('Successfully submitted taxonomy data:', response.data);
      alert(`Updated count: ${response.data.updatedCount}`);
    }
  };

  // Form Implementation
```

## Configuration

### Environment Variables

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_next_auth_secret
NEXT_PUBLIC_ADMIN_EMAILS=your_public_admin_emails
NEXT_PUBLIC_ALLOWED_DOMAIN=your_public_allowed_domain
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
USER_SERVICE_URL=http://localhost:3001
SKILLS_SERVICE_URL=http://localhost:3002
LEARNING_SERVICE_URL=http://localhost:3003
```

## Error Handling & Formatting

Utilities for formatting error and returning error messages.

```typescript
try {

} catch (error) {
  console.error(handleApiError(error.code));
  return formatError(error: ApiError)
}
```

Custom error routing in app/error/[error]/page.tsx

```typescript
if (error.status === 401) redirect('/error/unauthorized');
```
