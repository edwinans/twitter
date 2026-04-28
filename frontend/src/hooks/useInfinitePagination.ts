import { useEffect, useRef, useState } from 'react';

interface PaginatedPage<T> {
  items: T[];
  totalPages: number;
}

interface UseInfinitePaginationOptions<T> {
  loadPage: (page: number) => Promise<PaginatedPage<T>>;
  resetKey: string | number;
  errorMessage: string;
}

export function useInfinitePagination<T>({
  loadPage,
  resetKey,
  errorMessage,
}: UseInfinitePaginationOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const loadPageRef = useRef(loadPage);

  useEffect(() => {
    loadPageRef.current = loadPage;
  }, [loadPage]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setTotalPages(1);
    setError('');
    setIsLoading(true);
    setIsLoadingMore(false);
    setHasMore(true);
  }, [resetKey]);

  useEffect(() => {
    let isMounted = true;

    const loadItems = async () => {
      setError('');

      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await loadPageRef.current(page);
        if (!isMounted) {
          return;
        }

        setItems((currentItems) =>
          page === 1 ? response.items : [...currentItems, ...response.items]
        );
        setTotalPages(response.totalPages);
        setHasMore(page < response.totalPages && response.items.length > 0);
      } catch {
        if (!isMounted) {
          return;
        }

        setError(errorMessage);
      } finally {
        if (isMounted) {
          if (page === 1) {
            setIsLoading(false);
          } else {
            setIsLoadingMore(false);
          }
        }
      }
    };

    void loadItems();

    return () => {
      isMounted = false;
    };
  }, [page, resetKey, errorMessage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPage((currentPage) => currentPage + 1);
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, isLoadingMore]);

  const prependItem = (item: T) => {
    setItems((currentItems) => [item, ...currentItems]);
  };

  return {
    items,
    error,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    totalPages,
    sentinelRef,
    prependItem,
    setError,
  };
}
