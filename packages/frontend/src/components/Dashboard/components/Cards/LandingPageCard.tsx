import { LandingPageCardProps } from '@/components/Dashboard/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LandingPageCard({
  title,
  cardCn,
  cardHeaderCn,
  cardTitleCn,
  descriptionCn,
  iconCn,
  cardContentCn,
  description,
  content,
  contentHeader,
  contentCn,
  contentHeaderCn,
  icon: Icon,
}: LandingPageCardProps) {
  return (
    <div>
      <Card
        className={cn(
          'h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group',
          cardCn,
        )}
      >
        <CardHeader
          className={cn('flex flex-row items-center justify-between space-y-0 pb-2', cardHeaderCn)}
        >
          <CardTitle
            className={cn(
              'text-xl font-semibold group-hover:text-blue-600 transition-colors duration-300',
              cardTitleCn,
            )}
          >
            {title}
          </CardTitle>
          {description && (
            <CardDescription className={cn('text-sm text-muted-foreground', descriptionCn)}>
              {description}
            </CardDescription>
          )}
          {Icon && (
            <Icon
              className={cn(
                'h-8 w-8 group-hover:scale-110 transition-transform duration-300',
                iconCn,
              )}
            />
          )}
        </CardHeader>
        <CardContent className={cn('', cardContentCn)}>
          <div
            className={cn(
              'text-3xl font-bold text-gray-900 dark:text-gray-300 mb-2',
              contentHeaderCn,
            )}
          >
            {contentHeader}
          </div>
          <p
            className={cn(
              'text-sm text-gray-600 group-hover:text-gray-800 transition-colors duration-300',
              contentCn,
            )}
          >
            {content}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
