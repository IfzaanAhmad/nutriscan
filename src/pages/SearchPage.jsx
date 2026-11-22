import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import FilterBar from '../components/FilterBar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SkeletonGrid from '../components/SkeletonGrid.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useProductSearch } from '../hooks/useProductSearch.js';
import { useProducts } from '../context/ProductsContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import styles from './SearchPage.module.css';

const CATEGORIES = [
  { tag: 'en:beverages', label: 'Beverages' },
  { tag: 'en:breakfasts', label: 'Breakfast' },
  { tag: 'en:cereals-and-potatoes', label: 'Cereals & potatoes' },
  { tag: 'en:dairies', label: 'Dairy' },
  { tag: 'en:meals', label: 'Meals' },
  { tag: 'en:meats', label: 'Meat' },
  { tag: 'en:plant-based-foods', label: 'Plant-based' },
  { tag: 'en:snacks', label: 'Snacks' },
  { tag: 'en:spreads', label: 'Spreads' },
  { tag: 'en:sweet-snacks', label: 'Sweet snacks' },
];

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 60;
const DEBOUNCE_MS = 600; 

// Live search: results update as the user types, but only after a short pause
export default function SearchPage() {
  const { savedCodes, pinnedCodes, onToggleSaved, onTogglePinned } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();

  const [input, setInput] = useState(query);
  const [category, setCategory] = useState('');
  const [grade, setGrade] = useState('');
  const [submitError, setSubmitError] = useState('');

  const { status, products, error, mode, retry, total, hasMore, loadingMore, moreError, loadMore } =
    useProductSearch(query);
  usePageTitle(query ? `“${query}”` : 'Search');
  const typed = input.trim();

  // Validation rules for the search box.
  let liveError = '';
  if (typed.length > MAX_QUERY_LENGTH) {
    liveError = `Search is too long (${typed.length} characters). Shorten it to ${MAX_QUERY_LENGTH} or fewer.`;
  } else if (typed.length > 0 && !/[\p{L}\p{N}]/u.test(typed)) {
    liveError = 'Search needs at least one letter or number. Symbols on their own are ignored.';
  }

  const searchError = liveError || submitError;
  const wanted = !liveError && typed.length >= MIN_QUERY_LENGTH ? typed : '';

  function handleInputChange(value) {
    setInput(value);
    setSubmitError(''); 
  }

  function commit(value) {
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  useEffect(() => {
    if (liveError || wanted === query) return undefined;
    const timer = setTimeout(() => setSearchParams(wanted ? { q: wanted } : {}, { replace: true }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [wanted, query, liveError, setSearchParams]);

  // When the URL's query changes from outside (Back/Forward), put it back in
  // the box. Done during render, which React recommends over an effect here.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    if (query !== wanted) setInput(query);
  }

  function handleSubmit() {
    if (liveError) return; 
    if (typed === '') {
      setSubmitError('Search box is empty. Type a product name, for example “oat milk”.');
      return;
    }
    if (typed.length < MIN_QUERY_LENGTH) {
      setSubmitError(`Search needs at least ${MIN_QUERY_LENGTH} letters. Keep typing, for example “oat” instead of “o”.`);
      return;
    }
    if (wanted === query) {
      if (status === 'error') retry();
    } else {
      commit(wanted);
    }
  }

  const isPending = !liveError && wanted !== query;
  const isLoading = isPending || status === 'loading';
  const filtered = products.filter((p) => {
    const matchesCategory = !category || p.categories_tags.includes(category);
    const matchesGrade = !grade || p.nutriscore_grade === grade;
    return matchesCategory && matchesGrade;
  });
  const filtersActive = Boolean(category || grade);

  function clearFilters() {
    setCategory('');
    setGrade('');
  }

  function clearAll() {
    clearFilters();
    setInput('');
    commit('');
  }

  function renderResults() {
    if (isLoading) {
      return <SkeletonGrid label={wanted ? `Searching for “${wanted}”…` : 'Loading popular products…'} />;
    }

    if (status === 'error') {
      return (
        <StatusMessage
          type="error"
          title={
            error?.kind === 'rate-limit'
              ? 'Too many searches'
              : mode === 'search'
                ? 'Search failed'
                : 'Couldn’t load products'
          }
          message={error?.message ?? 'Something went wrong. Please try again.'}
          action={
            <button type="button" className="btn btn-primary" onClick={retry}>
              Try again
            </button>
          }
        />
      );
    }

    if (mode === 'search' && products.length === 0) {
      return (
        <StatusMessage
          type="empty"
          title={`No products found for “${query}”`}
          message="Check the spelling, or try a brand or a simpler name like “yogurt”."
          action={
            <button type="button" className="btn" onClick={clearAll}>
              Clear search
            </button>
          }
        />
      );
    }

    if (filtered.length === 0) {
      return (
        <StatusMessage
          type="empty"
          title="No products match these filters"
          message={`${products.length} product${products.length === 1 ? '' : 's'} found, but none in this category or Nutri-Score.`}
          action={
            <>
              <button type="button" className="btn btn-primary" onClick={clearFilters}>
                Clear filters
              </button>
              {hasMore && (
                <button type="button" className="btn" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Search more results'}
                </button>
              )}
            </>
          }
        />
      );
    }

    return (
      <>
        <p className={styles.count}>
          {mode === 'search'
            ? `${filtered.length} result${filtered.length === 1 ? '' : 's'} for “${query}”`
            : 'Popular products'}
          {filtersActive && ` (filtered from ${products.length} loaded)`}
          {mode === 'search' && total > products.length && ` · ${total.toLocaleString()} found in total`}
        </p>
        <div className={styles.grid}>
          {filtered.map((product) => (
            <ProductCard
              key={product.code}
              product={product}
              isSaved={savedCodes.includes(product.code)}
              isPinned={pinnedCodes.includes(product.code)}
              onToggleSaved={onToggleSaved}
              onTogglePinned={onTogglePinned}
            />
          ))}
        </div>
        {hasMore && (
          <div className={styles.more}>
            <button type="button" className="btn" onClick={loadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading more…' : `Load more results (${products.length} loaded)`}
            </button>
            {moreError && (
              <p className={styles.moreError} role="alert">
                {moreError.message}
              </p>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <section className={styles.hero}>
        <h1>Know what&apos;s in your food</h1>
        <p>Search millions of packaged products from Open Food Facts, check their nutrition, and compare two side by side.</p>
        <SearchBar value={input} onChange={handleInputChange} onSubmit={handleSubmit} error={searchError} />
        {!searchError && typed.length > 0 && typed.length < MIN_QUERY_LENGTH && (
          <p className={styles.hint}>Type at least {MIN_QUERY_LENGTH} letters to search.</p>
        )}
      </section>

      <FilterBar
        categories={CATEGORIES}
        category={category}
        grade={grade}
        onCategoryChange={setCategory}
        onGradeChange={setGrade}
        onClear={clearFilters}
      />

      {renderResults()}
    </>
  );
}