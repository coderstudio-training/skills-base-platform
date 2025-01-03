import { useEffect, useRef } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export default function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverOptions = {},
) {
  const targetRef = useRef<HTMLDivElement | null>(null); // Specifically for HTMLDivElement
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;

    observerRef.current = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback(entry);
      }
    }, options);

    const observer = observerRef.current;
    observer.observe(targetRef.current);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return targetRef;
}
