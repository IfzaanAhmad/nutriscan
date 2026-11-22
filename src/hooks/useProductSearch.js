import { useEffect, useRef, useState } from 'react';
import { getPopularProducts, rememberProducts, searchProducts } from '../services/api.js';

const CACHE_TTL_MS = 10 * 60 * 1000;
const memoryCache = new Map();

// Each cached entry holds every page loaded so far for that query.
const cache = {
  get(query) {
    let entry = memoryCache.get(query);
    if (!entry) {
      try {
        entry = JSON.parse(sessionStorage.getItem(`nutriscan:search:${query}`));
      } catch {
        entry = null;
      }
    }
    if (!entry || !Array.isArray(entry.products) || Date.now() - entry.savedAt > CACHE_TTL_MS) return undefined;
    memoryCache.set(query, entry);
    rememberProducts(entry.products);
    return entry;
  },
  set(query, result) {
    const entry = { savedAt: Date.now(), ...result };
    memoryCache.set(query, entry);
    try {
      sessionStorage.setItem(`nutriscan:search:${query}`, JSON.stringify(entry));
    } catch {
      // cache is optional: if storage is full we just search again next time
    }
  },
};

function fetchPage(query, page, signal) {
  return query ? searchProducts(query, { signal, page }) : getPopularProducts({ signal, page });
}

const EMPTY = { products: [], page: 0, pageCount: 0, total: 0 };

export function useProductSearch(query) {
  const [state, setState] = useState(() => {
    const cached = cache.get(query);
    return cached
      ? { status: 'success', ...cached, error: null, query }
      : { status: 'loading', ...EMPTY, error: null, query };
  });
  const [retryCount, setRetryCount] = useState(0);
  // "Load more" is separate from the main status, so the results already on
  // screen stay visible while the next page loads (or if it fails).
  const [more, setMore] = useState({ loading: false, error: null });
  const moreController = useRef(null);

  useEffect(() => {
    moreController.current?.abort();
    setMore({ loading: false, error: null });

    const cached = cache.get(query);
    if (cached) {
      setState({ status: 'success', ...cached, error: null, query });
      return undefined;
    }

    const controller = new AbortController();

    async function load() {
      setState({ status: 'loading', ...EMPTY, error: null, query });
      try {
        const first = await fetchPage(query, 1, controller.signal);
        const result = { products: first.products, page: 1, pageCount: first.pageCount, total: first.total };
        cache.set(query, result);
        setState({ status: 'success', ...result, error: null, query });
      } catch (err) {
        if (controller.signal.aborted) return;
        setState({ status: 'error', ...EMPTY, error: err, query });
      }
    }

    load();
    return () => controller.abort();
  }, [query, retryCount]);

  async function loadMore() {
    if (more.loading || state.status !== 'success' || state.page >= state.pageCount) return;
    const controller = new AbortController();
    moreController.current = controller;
    setMore({ loading: true, error: null });
    try {
      const next = await fetchPage(query, state.page + 1, controller.signal);
      // The API can return a product again on a later page: keep one copy
      const seen = new Set(state.products.map((p) => p.code));
      const added = next.products.filter((p) => !seen.has(p.code));
      const result = {
        products: [...state.products, ...added],
        page: state.page + 1,
        pageCount: next.pageCount,
        total: next.total,
      };
      cache.set(query, result);
      setState({ status: 'success', ...result, error: null, query });
      setMore({ loading: false, error: null });
    } catch (err) {
      if (controller.signal.aborted) return;
      setMore({ loading: false, error: err });
    }
  }

  const isCurrent = state.query === query;

  return {
    status: isCurrent ? state.status : 'loading',
    products: isCurrent ? state.products : [],
    error: isCurrent ? state.error : null,
    total: isCurrent ? state.total : 0,
    hasMore: isCurrent && state.status === 'success' && state.page < state.pageCount,
    loadingMore: more.loading,
    moreError: more.error,
    loadMore,
    mode: query ? 'search' : 'popular',
    retry: () => setRetryCount((n) => n + 1),
  };
}
