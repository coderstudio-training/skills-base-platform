import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoginFormCardProps } from '../../types';
import BaseCard from './BaseCard';

export function LoginFormCard({
  formState,
  handleInputChange,
  handleSubmit,
  adminLoginLoading,
  adminLoginError,
  title = 'Admin Login',
  description = 'Enter your credentials to access the admin dashboard',
  className = 'w-full max-w-md',
}: LoginFormCardProps) {
  return (
    <BaseCard title={title} description={description} height={className}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="admin@example.com"
            value={formState.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formState.password}
            onChange={handleInputChange}
            required
          />
        </div>
        {adminLoginError && (
          <Alert variant="destructive">
            <AlertDescription>{adminLoginError.message}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={adminLoginLoading}>
          {adminLoginLoading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </BaseCard>
  );
}
