import useScrollTo from '@/components/Dashboard/hooks/useScrollTo';
import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { ChevronUpCircle } from 'lucide-react';

export default function SkillFooter() {
  const { scrollTo } = useScrollTo();
  const handleScrollToForm = () => {
    scrollTo('tsc-header');
  };

  return (
    <CardFooter className="flex justify-end bg-background">
      <Button
        size={'sm'}
        className="bg-violet-300 hover:bg-violet-400 dark:bg-violet-600 dark:hover:bg-violet-500"
        onClick={handleScrollToForm}
      >
        <ChevronUpCircle className="h-4 w-4" />
      </Button>
    </CardFooter>
  );
}
