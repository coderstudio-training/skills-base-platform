# Domain-Restricted Google Authentication Guide

This guide explains how the automatic Google authentication works for users with specific email domains, including both frontend and backend implementations.

## Overview

The system automatically redirects users to Google login when:

1. They have an email from the allowed domain (@stratpoint.com)
2. They are not an admin user

## Frontend Configuration

1. Set up environment variables in `.env.local`:

```env
NEXT_PUBLIC_ALLOWED_DOMAIN=@stratpoint.com
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
NEXT_PUBLIC_USER_SERVICE_URL=http://localhost:3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

## Backend Configuration

1. Set up environment variables in user-service's `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
```

## Authentication Flow

### 1. Frontend Domain Check & Redirection

```typescript
const isAllowedDomain = (email: string): boolean => {
  const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || '@stratpoint.com';
  return email.toLowerCase().endsWith(allowedDomain);
};

// In LandingDashboard component
useEffect(() => {
  const handleInitialRouting = async () => {
    if (status === 'unauthenticated') {
      const userEmail = session?.user?.email || '';
      if (isAllowedDomain(userEmail) && !isAdminEmail(userEmail)) {
        await signIn('google', { callbackUrl: '/api/auth/callback/google' });
      }
    }
  };
}, [session, status]);
```

### 2. Backend Google Token Verification & Role Assignment

```typescript
// In AuthService
async verifyGoogleToken(token: string) {
  const ticket = await this.googleClient.verifyIdToken({
    idToken: token,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  return this.handleGoogleUser(payload);
}

private async handleGoogleUser(payload: TokenPayload) {
  const { email, sub: googleId, given_name, family_name } = payload;

  let user = await this.usersService.findByEmail(email);

  if (!user) {
    // New user creation with default role
    user = await this.usersService.create({
      email,
      googleId: googleId!,
      firstName: given_name || 'Google',
      lastName: family_name || 'User',
      roles: [UserRole.USER], // Default role for new users
    });
  }

  // Generate JWT with user's roles
  const jwtPayload = { email: user.email, sub: user.id, roles: user.roles };
  return {
    access_token: this.jwtService.sign(jwtPayload),
    roles: user.roles,
  };
}
```

### 3. Role-Based Redirection

After successful authentication, users are redirected to their role-specific dashboard:

```typescript
// Google Auth callback route
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (token?.role) {
    const role = token.role.toLowerCase();
    return NextResponse.redirect(new URL(`${window.location.origin}/dashboard/${role}`, req.url));
  }
}
```

## User Types and Roles

1. **Regular Users (@stratpoint.com)**

   - Automatically redirected to Google login
   - Assigned UserRole.USER by default
   - Access staff dashboard

2. **Admin Users**

   - Must be listed in NEXT_PUBLIC_ADMIN_EMAILS
   - Use credential-based login
   - Access admin dashboard

3. **Manager Users**
   - Role must be manually assigned in the database (via Admin Dashboard)
   - Use Google login
   - Access manager dashboard

## Role Assignment Logic

1. **New Users**

   - Created with UserRole.USER by default
   - Email domain must match NEXT_PUBLIC_ALLOWED_DOMAIN
   - Google authentication required

2. **Existing Users**
   - Roles preserved from database
   - Google ID updated if not present
   - JWT token includes current roles

## Security Implementation

### Frontend Security

1. Domain restriction check
2. Admin email verification
3. Secure token handling
4. Role-based route protection

### Backend Security

1. Google token verification
2. JWT token generation
3. Role-based access control
4. Secure password handling for admin users

## Error Handling

1. Invalid Google Token:

```typescript
catch (error) {
  throw new UnauthorizedException('Invalid Google token');
}
```

2. Unauthorized Domain:

```typescript
if (!isAllowedDomain(email)) {
  setError('Your email domain is not authorized to access this application.');
}
```

3. Missing Configuration:

```typescript
if (!clientId) {
  throw new InternalServerErrorException('Google Client ID is not defined');
}
```

## Best Practices

1. Environment Variables

   - Keep sensitive credentials in environment variables
   - Use different credentials for development and production

2. Role Management

   - Default to least privilege (UserRole.USER)
   - Manually assign elevated privileges
   - Regularly audit user roles

3. Security

   - Validate tokens on both frontend and backend
   - Implement proper error handling
   - Log authentication attempts
   - Monitor for suspicious activities

4. User Experience
   - Automatic redirection for allowed domains
   - Clear error messages for unauthorized access
   - Smooth role-based navigation
