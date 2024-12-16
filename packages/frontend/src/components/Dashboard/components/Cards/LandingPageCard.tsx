import { LandingPageCardProps } from '../../types';
import BaseCard from './BaseCard';

export function LandingPageCard({
  title,
  description,
  contentHeader,
  content,
  icon: Icon,
}: LandingPageCardProps) {
  return (
    <BaseCard
      title={title}
      description={description}
      headerExtra={Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
    >
      <div className="text-2xl font-bold">{contentHeader}</div>
      <p className="text-xs text-muted-foreground">{content}</p>
    </BaseCard>
  );
}
