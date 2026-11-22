import { createContext, useContext, useEffect, useState } from 'react';


const ProductsContext = createContext(null);

const MAX_PINNED = 2;
const SAVED_KEY = 'nutriscan:saved';
const PINNED_KEY = 'nutriscan:pinned';
const LIMITS_KEY = 'nutriscan:limits';

// Per-100 g warning levels. 
export const DEFAULT_LIMITS = { sugar: 22.5, salt: 1.5 };

function isProduct(p) {
  return p !== null && typeof p === 'object' && typeof p.code === 'string' && typeof p.nutriments === 'object' && p.nutriments !== null;
}

function loadProducts(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return Array.isArray(parsed) ? parsed.filter(isProduct) : [];
  } catch {
    return [];
  }
}

function loadLimits() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LIMITS_KEY));
    const valid = (n) => typeof n === 'number' && n >= 0 && n <= 100;
    if (parsed && valid(parsed.sugar) && valid(parsed.salt)) return parsed;
  } catch {
    // fall through to the defaults
  }
  return DEFAULT_LIMITS;
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked: the app still works, it just won't remember
  }
}

export function ProductsProvider({ children }) {
  const [savedProducts, setSavedProducts] = useState(() => loadProducts(SAVED_KEY));
  const [pinnedProducts, setPinnedProducts] = useState(() => loadProducts(PINNED_KEY).slice(-MAX_PINNED));
  const [limits, setLimits] = useState(loadLimits);

  useEffect(() => save(SAVED_KEY, savedProducts), [savedProducts]);
  useEffect(() => save(PINNED_KEY, pinnedProducts), [pinnedProducts]);
  useEffect(() => save(LIMITS_KEY, limits), [limits]);

  function toggleSaved(product) {
    setSavedProducts((prev) =>
      prev.some((p) => p.code === product.code)
        ? prev.filter((p) => p.code !== product.code)
        : [...prev, product]
    );
  }

  function togglePinned(product) {
    setPinnedProducts((prev) => {
      if (prev.some((p) => p.code === product.code)) {
        return prev.filter((p) => p.code !== product.code);
      }
      // Only two products can be compared, so pinning a third
      // replaces the oldest pin.
      const next = [...prev, product];
      return next.length > MAX_PINNED ? next.slice(-MAX_PINNED) : next;
    });
  }


  const value = {
    savedProducts,
    pinnedProducts,
    savedCodes: savedProducts.map((p) => p.code),
    pinnedCodes: pinnedProducts.map((p) => p.code),
    onToggleSaved: toggleSaved,
    onTogglePinned: togglePinned,
    onClearSaved: () => setSavedProducts([]),
    onClearPinned: () => setPinnedProducts([]),
    limits,
    onSaveLimits: setLimits,
  };
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside <ProductsProvider>');
  return ctx;
}
