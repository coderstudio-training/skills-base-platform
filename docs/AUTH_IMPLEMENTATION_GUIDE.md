# Authentication & RBAC Implementation Guide

This guide explains how to implement authentication and Role-Based Access Control (RBAC) in your NestJS microservice using the shared authentication system.

## Prerequisites

1. Your service must have `@skills-base/shared` as a dependency in package.json:

```json
{
  "dependencies": {
    "@skills-base/shared": "^1.0.0"
  }
}
```

2. Environment Variables Required:

```env
JWT_SECRET=your_jwt_secret  # Must match user-service JWT_SECRET
```

## Step 1: Import Required Components

In your controller file (e.g., `your.controller.ts`), import the necessary guards, decorators, and types:

```typescript
import { JwtAuthGuard, RolesGuard } from '@skills-base/shared/guards';
import { Roles } from '@skills-base/shared/decorators';
import { UserRole } from '@skills-base/shared/constants';
```

## Step 2: Implement Authentication

### Basic Authentication (JWT Only)

To protect a route that requires authentication but no specific role:

```typescript
@Controller('your-endpoint')
export class YourController {
  @UseGuards(JwtAuthGuard) // Only requires valid JWT
  @Get('authenticated-route')
  async protectedRoute() {
    // Only accessible by authenticated users
    return { message: 'You are authenticated!' };
  }
}
```

### Accessing User Data

The authenticated user's data is available in the request object:

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  // req.user contains the decoded JWT payload
  return req.user;
}
```

## Step 3: Implement Role-Based Access Control

### Single Role Requirement

To restrict a route to users with a specific role:

```typescript
@Controller('your-endpoint')
export class YourController {
  @UseGuards(JwtAuthGuard, RolesGuard) // Both authentication and role check
  @Roles(UserRole.ADMIN) // Only admins can access
  @Get('admin-route')
  async adminOnlyRoute() {
    return { message: 'You are an admin!' };
  }
}
```

### Multiple Roles

To allow multiple roles to access a route:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)  // Admins OR managers can access
@Get('management-route')
async managementRoute() {
  return { message: 'You are either an admin or manager!' };
}
```

### Controller-Level Protection

To protect all routes in a controller:

```typescript
@UseGuards(JwtAuthGuard, RolesGuard) // Applied to all routes in controller
@Controller('protected')
export class ProtectedController {
  @Roles(UserRole.ADMIN) // Additional role requirement for this specific route
  @Get('admin')
  adminRoute() {
    return 'Admin only';
  }

  @Roles(UserRole.MANAGER) // Different role for this route
  @Get('manager')
  managerRoute() {
    return 'Manager only';
  }
}
```

## Available Roles

The following roles are defined in `UserRole`:

```typescript
enum UserRole {
  ADMIN = 'admin',
  USER = 'staff',
  MANAGER = 'manager',
}
```

## Error Handling

The guards will automatically handle unauthorized access:

- Missing/Invalid JWT → 401 Unauthorized
- Invalid Role → 403 Forbidden

No additional error handling is required in your controllers.

## Testing Protected Routes

When writing tests, you'll need to mock the authentication:

```typescript
describe('YourController', () => {
  it('should allow admin access', () => {
    const mockRequest = {
      user: {
        userId: 'test-id',
        roles: [UserRole.ADMIN],
      },
    };

    // Test your controller with mockRequest
  });
});
```

## Common Issues

1. "Unauthorized" error despite valid token:

   - Verify JWT_SECRET matches user-service
   - Check token expiration
   - Ensure token is in Authorization header: "Bearer <token>"

2. "Forbidden" error with valid token:
   - Check if user has required role(s)
   - Verify roles array in JWT payload
   - Ensure RolesGuard is after JwtAuthGuard in @UseGuards()

## Best Practices

1. Always use both JwtAuthGuard and RolesGuard when implementing RBAC
2. Apply guards at controller level when most/all routes need protection
3. Use most restrictive roles possible for each route
4. Don't expose role information in API responses
5. Keep JWT_SECRET secure and consistent across services
