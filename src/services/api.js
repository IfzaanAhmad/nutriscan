
const SEARCH_URL = '/off-search/search';
const PRODUCT_URL = '/off-api/api/v2/product';
const TIMEOUT_MS = 15000; // the search endpoint can be slow; give up after 15 s
const PAGE_SIZE = 24;

// Only ask the API for the fields we display. Smaller responses load faster.
const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_en',
  'brands',
  'quantity',
  'nutriscore_grade',
  'image_front_small_url',
  'image_front_url',
  'image_url',
  'categories_tags',
  'nutriments',
  'ingredients_text',
  'ingredients_text_en',
  'allergens_tags',
].join(',');


const LIMITS = { search: 15, product: 14 }; 
const WINDOW_MS = 60 * 1000;
const memoryLog = { search: [], product: [] };

function loadLog(kind) {
  try {
    return JSON.parse(sessionStorage.getItem(`nutriscan:requests:${kind}`)) ?? [];
  } catch {
    return memoryLog[kind]; 
  }
}

function saveLog(kind, log) {
  memoryLog[kind] = log;
  try {
    sessionStorage.setItem(`nutriscan:requests:${kind}`, JSON.stringify(log));
  } catch {
    // sessionStorage unavailable: memoryLog still limits requests for this tab
  }
}

function reserveRequest(kind) {
  const now = Date.now();
  const recent = loadLog(kind).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= LIMITS[kind]) {
    const waitSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - recent[0])) / 1000));
    const what = kind === 'search' ? 'searches' : 'product lookups';
    throw new ApiError(
      'rate-limit',
      `To avoid overloading Open Food Facts, NutriScan allows ${LIMITS[kind]} ${what} a minute. Please wait ${waitSeconds} seconds and try again.`
    );
  }
  recent.push(now);
  saveLog(kind, recent);
}


const productCache = new Map();
export function rememberProducts(products) {
  products.forEach((p) => productCache.set(p.code, p));
}


export class ApiError extends Error {
  constructor(kind, message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind; 
    this.status = status;
  }
}

function errorForStatus(status) {
  if (status === 404) {
    return new ApiError('not-found', 'We couldn’t find that product.', status);
  }
  if (status === 429) {
    return new ApiError(
      'rate-limit',
      'Open Food Facts says we sent too many requests in a short time. Wait a minute and try again.',
      status
    );
  }
  if (status === 400) {
    return new ApiError('server', 'The food database couldn’t understand that search. Try different words.', status);
  }
  if (status >= 500) {
    return new ApiError(
      'server',
      'The Open Food Facts database is having trouble right now. Please try again shortly.',
      status
    );
  }
  return new ApiError('server', `The request failed (error ${status}). Please try again.`, status);
}


async function fetchJson(url, { signal } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort);

  try {
    if (signal?.aborted) controller.abort();
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      throw errorForStatus(res.status);
    }

    try {
      return await res.json();
    } catch {
      throw new ApiError('bad-response', 'The server sent back data we couldn’t read. Please try again.');
    }
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err.name === 'AbortError') {
      if (timedOut) {
        throw new ApiError('timeout', 'The food database is taking too long to respond. Please try again.');
      }
      throw err; 
    }

    
    if (!navigator.onLine) {
      throw new ApiError('offline', 'You’re offline. Check your internet connection and try again.');
    }
    
    throw new ApiError('network', 'We couldn’t reach the food database. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

const VALID_GRADES = ['a', 'b', 'c', 'd', 'e'];
function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}


function tagToLabel(tag) {
  const text = String(tag).replace(/^[a-z]{2}:/, '').replace(/-/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatAllergens(tags) {
  if (!Array.isArray(tags)) return null; 
  if (tags.length === 0) return 'None declared';
  return tags.map(tagToLabel).join(', ');
}

function firstBrand(brands) {
  const first = Array.isArray(brands) ? brands[0] : String(brands ?? '').split(',')[0];
  return first ? String(first).trim() || null : null;
}

function cleanQuery(query) {
  return query.replace(/[+\-!(){}[\]^"~*?:\\/&|%]/g, ' ').replace(/\s+/g, ' ').trim();
}


export function normalizeProduct(raw) {
  const n = raw.nutriments ?? {};
  const grade = String(raw.nutriscore_grade ?? '').toLowerCase();

  return {
    code: String(raw.code),
    product_name: (raw.product_name_en || raw.product_name || '').trim() || 'Unnamed product',
    brands: firstBrand(raw.brands),
    quantity: raw.quantity || null,
    nutriscore_grade: VALID_GRADES.includes(grade) ? grade : null, 
    image_url: raw.image_front_url || raw.image_url || raw.image_front_small_url || null,
    image_small_url: raw.image_front_small_url || raw.image_front_url || raw.image_url || null,
    categories_tags: Array.isArray(raw.categories_tags) ? raw.categories_tags : [],
    ingredients_text: (raw.ingredients_text_en || raw.ingredients_text || '').trim() || null,
    allergens: formatAllergens(raw.allergens_tags),
    nutriments: {
      'energy-kcal_100g': toNumber(n['energy-kcal_100g']),
      fat_100g: toNumber(n.fat_100g),
      'saturated-fat_100g': toNumber(n['saturated-fat_100g']),
      carbohydrates_100g: toNumber(n.carbohydrates_100g),
      sugars_100g: toNumber(n.sugars_100g),
      fiber_100g: toNumber(n.fiber_100g),
      proteins_100g: toNumber(n.proteins_100g),
      salt_100g: toNumber(n.salt_100g),
    },
  };
}

function readProductList(data) {
  if (!data || !Array.isArray(data.hits)) {
    throw new ApiError('bad-response', 'The server sent back data we couldn’t read. Please try again.');
  }
  const products = data.hits.filter((p) => p && p.code).map(normalizeProduct);
  products.forEach((p) => productCache.set(p.code, p));
  return products;
}


// Search results come in pages. Returns this page's products plus how many
// pages exist, so the Search page can offer "Load more".
function readPage(data) {
  const products = readProductList(data);
  const pageCount = Number.isFinite(data.page_count) ? data.page_count : 1;
  const total = Number.isFinite(data.count) ? data.count : products.length;
  return { products, pageCount, total };
}

// A 404 from the search service means the search itself failed, not that a
// product is missing, so it gets its own message.
async function fetchSearch(params, signal) {
  reserveRequest('search');
  try {
    return await fetchJson(`${SEARCH_URL}?${params}`, { signal });
  } catch (err) {
    if (err instanceof ApiError && err.kind === 'not-found') {
      throw new ApiError('server', 'The search service couldn’t be reached right now. Please try again shortly.', err.status);
    }
    throw err;
  }
}

export async function searchProducts(query, { signal, page = 1 } = {}) {
  const cleaned = cleanQuery(query);
  if (!cleaned) return { products: [], pageCount: 0, total: 0 };
  const params = new URLSearchParams({
    q: cleaned,
    page: String(page),
    page_size: String(PAGE_SIZE),
    fields: PRODUCT_FIELDS,
  });
  return readPage(await fetchSearch(params, signal));
}

export async function getPopularProducts({ signal, page = 1 } = {}) {
  const params = new URLSearchParams({
    sort_by: '-unique_scans_n',
    page: String(page),
    page_size: String(PAGE_SIZE),
    fields: PRODUCT_FIELDS,
  });
  return readPage(await fetchSearch(params, signal));
}

export async function getProductByBarcode(barcode, { signal } = {}) {
  if (!/^\d{4,14}$/.test(barcode)) {
    throw new ApiError('not-found', 'That doesn’t look like a valid barcode.');
  }
  if (productCache.has(barcode)) return productCache.get(barcode);

  const params = new URLSearchParams({ fields: PRODUCT_FIELDS });
  reserveRequest('product');
  const data = await fetchJson(`${PRODUCT_URL}/${barcode}.json?${params}`, { signal });

  if (!data || data.status === 0 || !data.product) {
    throw new ApiError('not-found', 'We couldn’t find that product.');
  }
  const product = normalizeProduct({ code: barcode, ...data.product });
  productCache.set(barcode, product);
  return product;
}