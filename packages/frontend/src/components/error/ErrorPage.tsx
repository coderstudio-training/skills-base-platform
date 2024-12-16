// components/ErrorPage.tsx
'use client';

import { useLogout } from '@/components/Dashboard/hooks/useLogout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorPageProps {
  statusCode: number | string;
  message: string;
}

export default function ErrorPage({ statusCode, message }: ErrorPageProps) {
  const { handleLogout } = useLogout();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[380px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Error {statusCode}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{message}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
