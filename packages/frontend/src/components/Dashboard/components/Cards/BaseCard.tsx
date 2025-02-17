import { BaseCardProps } from '@/components/Dashboard/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const BaseCard = ({
  title,
  description,
  loading = false,
  error = null,
  loadingMessage = 'Loading...',
  errorMessage = 'Error loading data.',
  height = 'fixed',
  children,
  headerExtra,
}: BaseCardProps) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div
          className={`${height === 'fixed' ? 'h-[350px]' : 'py-8'} flex items-center justify-center`}
        >
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div
          className={`${height === 'fixed' ? 'h-[350px]' : 'py-8'} flex items-center justify-center`}
        >
          <p className="text-sm text-red-500">{errorMessage}</p>
        </div>
      );
    }

    return children;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="font-semibold tracking-tight">{title}</CardTitle>
            {description && (
              <CardDescription className="text-sm text-muted-foreground">
                {description}
              </CardDescription>
            )}
          </div>
          {headerExtra && <div className="ml-2">{headerExtra}</div>}
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
};

export default BaseCard;
