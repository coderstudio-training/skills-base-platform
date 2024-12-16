import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export const getSkillLevelLabel = (average: number) => {
  if (average <= 1) return 'Novice';
  if (average <= 2) return 'Beginner';
  if (average <= 3) return 'Intermediate';
  if (average <= 4) return 'Advanced';
  if (average <= 5) return 'Expert';
  return 'Guru';
};

export const getSkillStatusIcon = (currentLevel: number, requiredLevel: number) => {
  if (currentLevel >= requiredLevel) {
    return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  } else if (currentLevel === requiredLevel - 1) {
    return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
  }
  return <XCircle className="h-5 w-5 text-red-500" />;
};
