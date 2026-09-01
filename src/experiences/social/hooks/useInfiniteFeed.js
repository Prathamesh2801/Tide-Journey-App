import { useCallback, useEffect, useRef, useState } from "react";
import { getPostPage } from "../data/posts";
import { FEED_CONFIG } from "../config";

const { pageSize: PAGE_SIZE, maxPages: MAX_PAGES, simulatedLatencyMs: SIMULATED_LATENCY_MS } = FEED_CONFIG;

export function useInfiniteFeed() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosts(getPostPage(0, PAGE_SIZE));
      setPage(1);
      setIsInitialLoading(false);
    }, SIMULATED_LATENCY_MS);
    return () => clearTimeout(timer);
  }, []);

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || isInitialLoading) return;
    loadingRef.current = true;
    setIsLoadingMore(true);

    setTimeout(() => {
      setPosts((prev) => [...prev, ...getPostPage(page, PAGE_SIZE)]);
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
      loadingRef.current = false;
      if (page + 1 >= MAX_PAGES) setHasMore(false);
    }, SIMULATED_LATENCY_MS);
  }, [page, hasMore, isInitialLoading]);

  return { posts, isInitialLoading, isLoadingMore, hasMore, loadMore };
}
