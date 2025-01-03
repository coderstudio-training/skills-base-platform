import { useInfiniteScroll } from '@/components/Dashboard/hooks/useInfiniteScrolling';
import { TSC } from '@/components/Dashboard/types';
import { useState } from 'react';

export default function useTSCScroll(filteredTSCs: TSC[], itemsBeforeScroll: number = 3) {
  const [items, setItems] = useState<TSC[]>(filteredTSCs.slice(0, itemsBeforeScroll));
  const [hasMore, setHasMore] = useState(filteredTSCs.length > itemsBeforeScroll);

  const loadMore = () => {
    setTimeout(() => {
      setItems(prev => {
        const nextItems = filteredTSCs.slice(prev.length, prev.length + itemsBeforeScroll);
        setHasMore(nextItems.length > 0); // Check if there are more items to load
        return [...prev, ...nextItems];
      });
    }, 1000); // Simulated delay for loading
  };

  const loaderRef = useInfiniteScroll(() => {
    if (hasMore) {
      loadMore();
    }
  });

  return {
    items,
    loaderRef: hasMore ? loaderRef : null, // Remove loaderRef if no more items
    hasMore,
  };
}
