# NestJS Backend Permissions Implementation Guide

This guide explains how to implement the permissions system in the NestJS microservices architecture.

## 1. Permission Enum

```typescript
// packages/shared/src/constants/permissions.constant.ts
export enum Permission {
  VIEW_DASHBOARD = 'canViewDashboard',
  VIEW_SKILLS = 'canViewSkills',
  EDIT_OWN_SKILLS = 'canEditOwnSkills',
  EDIT_TEAM_SKILLS = 'canEditTeamSkills',
  EDIT_ALL_SKILLS = 'canEditAllSkills',
  VIEW_LEARNING = 'canViewLearning',
  EDIT_OWN_LEARNING = 'canEditOwnLearning',
  EDIT_TEAM_LEARNING = 'canEditTeamLearning',
  EDIT_ALL_LEARNING = 'canEditAllLearning',
  VIEW_REPORTS = 'canViewReports',
  MANAGE_TEAM = 'canManageTeam',
  MANAGE_SYSTEM = 'canManageSystem',
  MANAGE_USERS = 'canManageUsers',
}
```

## 2. Permissions Decorator

```typescript
// packages/shared/src/decorators/require-permissions.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { Permission } from '../constants/permissions.constant';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
```

## 3. Permissions Guard

```typescript
// packages/shared/src/guards/permissions.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from '../constants/permissions.constant';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredPermissions.every(permission => user.permissions?.includes(permission));
  }
}
```

## 4. JWT Strategy Update

```typescript
// packages/user-service/src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Permission } from '@shared/constants/permissions.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
```

## 5. Controller Implementation

### Skills Service

```typescript
// packages/skills-service/src/skills/skills.controller.ts
import { Controller, Get, Put, UseGuards } from '@nestjs/common';
import { Permission } from '@shared/constants/permissions.constant';
import { RequirePermissions } from '@shared/decorators/require-permissions.decorator';
import { PermissionsGuard } from '@shared/guards/permissions.guard';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';

@Controller('skills')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SkillsController {
  @Get()
  @RequirePermissions(Permission.VIEW_SKILLS)
  findAll() {
    // Implementation
  }

  @Put(':id')
  @RequirePermissions(Permission.EDIT_OWN_SKILLS)
  updateOwn() {
    // Implementation
  }

  @Put('team/:id')
  @RequirePermissions(Permission.EDIT_TEAM_SKILLS)
  updateTeam() {
    // Implementation
  }

  @Put('all/:id')
  @RequirePermissions(Permission.EDIT_ALL_SKILLS)
  updateAll() {
    // Implementation
  }
}
```

### Learning Service

```typescript
// packages/learning-service/src/courses/courses.controller.ts
@Controller('courses')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CoursesController {
  @Get()
  @RequirePermissions(Permission.VIEW_LEARNING)
  findAll() {
    // Implementation
  }

  @Post('assign/team')
  @RequirePermissions(Permission.EDIT_TEAM_LEARNING)
  assignToTeam() {
    // Implementation
  }

  @Put('admin/update')
  @RequirePermissions(Permission.EDIT_ALL_LEARNING)
  adminUpdate() {
    // Implementation
  }
}
```

## 6. User Entity

```typescript
// packages/user-service/src/users/entities/user.entity.ts
import { Entity, Column } from 'typeorm';
import { Permission } from '@shared/constants/permissions.constant';

@Entity()
export class User {
  @Column('simple-array')
  permissions: Permission[];
}
```

## 7. Auth Service Implementation

```typescript
// packages/user-service/src/auth/auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(user: any) {
    const payload = {
      username: user.username,
      sub: user.userId,
      permissions: user.permissions,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
```

## 8. Error Handling

```typescript
// packages/shared/src/exceptions/permission-denied.exception.ts
import { UnauthorizedException } from '@nestjs/common';

export class PermissionDeniedException extends UnauthorizedException {
  constructor() {
    super('You do not have permission to perform this action');
  }
}

// Using in guards
if (!hasRequiredPermissions) {
  throw new PermissionDeniedException();
}
```

## 9. Testing

```typescript
// packages/shared/src/guards/permissions.guard.spec.ts
describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('should allow access with correct permissions', () => {
    const context = createMockExecutionContext({
      user: {
        permissions: [Permission.VIEW_SKILLS],
      },
    });

    reflector.getAllAndOverride = jest.fn().mockReturnValue([Permission.VIEW_SKILLS]);

    expect(guard.canActivate(context)).toBeTruthy();
  });
});
```

## Best Practices

1. Always use the PermissionsGuard alongside JwtAuthGuard
2. Implement permissions at the most granular level needed
3. Keep permissions consistent across microservices
4. Use TypeScript enums for type safety
5. Include proper error handling
6. Implement comprehensive testing
7. Document all permission requirements

## Security Considerations

1. Always validate permissions on the backend
2. Use HTTPS for all API communications
3. Implement proper JWT token expiration
4. Regularly audit permission assignments
5. Log permission-related actions
6. Implement rate limiting for API endpoints

This implementation provides a secure and maintainable permissions system across your NestJS microservices architecture.
