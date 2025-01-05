import { useInfiniteScroll } from '@/components/Dashboard/hooks/useInfiniteScrolling';
import { Taxonomy } from '@/components/Dashboard/types';
import { useCallback, useEffect, useState } from 'react';

export default function useTaxonomyScroll(
  filteredSkills: Taxonomy[],
  itemsBeforeScroll: number = 3,
  isSearching: boolean,
) {
  const [items, setItems] = useState<Taxonomy[]>([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (isSearching) {
      setItems(filteredSkills); // Show all results for search
      setHasMore(false); // Disable infinite scrolling
    } else {
      // Reset for infinite scroll
      setItems(filteredSkills.slice(0, itemsBeforeScroll));
      setHasMore(filteredSkills.length > itemsBeforeScroll);
    }
  }, [filteredSkills, isSearching, itemsBeforeScroll]);

  const loadMore = useCallback(() => {
    setTimeout(() => {
      setItems(prev => {
        const nextItems = filteredSkills.slice(prev.length, prev.length + itemsBeforeScroll);
        setHasMore(nextItems.length > 0);

        return [...prev, ...nextItems];
      });
    }, 1000);
  }, [filteredSkills, itemsBeforeScroll]);

  const loaderRef = useInfiniteScroll(() => {
    if (hasMore && !isSearching) {
      loadMore();
    }
  });

  return {
    items,
    loaderRef: hasMore && !isSearching ? loaderRef : null,
    hasMore,
  };
}
