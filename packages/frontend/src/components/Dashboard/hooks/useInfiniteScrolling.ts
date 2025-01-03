import useIntersectionObserver from '@/components/Dashboard/hooks/useIntersectionObserver';
import { useState } from 'react';

export const useInfiniteScroll = (fetchMore: () => void) => {
  const [isFetching, setIsFetching] = useState(false);

  const loaderRef = useIntersectionObserver(() => {
    if (!isFetching) {
      setIsFetching(true);
      fetchMore();
      setIsFetching(false);
    }
  });

  return loaderRef;
};
