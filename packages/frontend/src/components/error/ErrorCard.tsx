'use client';

import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ErrorCardProps {
  cardTitle: string;
  description?: string;
  status?: string | number;
  message?: string;
  error_code?: string;
  refetch?: () => Promise<void>;
}

export default function ErrorCard({
  cardTitle,
  description = 'Something went wrong!',
  status = 'XXX',
  message = 'Undetermined error message',
  error_code = 'Undetermined error stack',
  refetch,
}: ErrorCardProps) {
  return (
    <Card className="w-full max-w-lg mx-auto border border-red-300 bg-red-50">
      {/* Header Section */}
      <CardHeader className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-800">{cardTitle}</CardTitle>
          <CardDescription className="text-sm text-gray-600">{description}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <p className="text-lg font-bold text-red-500">Error {status}</p>
        </div>
      </CardHeader>

      {/* Content Section */}
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-700">{message}</p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Code:</span> {error_code}
          </p>
        </div>
        {refetch && (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                await refetch();
              }}
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
