import { useEffect, useState } from 'react';
import { getProductByBarcode } from '../services/api.js';

export function useProduct(barcode) {
  const [state, setState] = useState({ status: 'loading', product: null, error: null, barcode });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setState({ status: 'loading', product: null, error: null, barcode });
      try {
        const product = await getProductByBarcode(barcode, { signal: controller.signal });
        setState({ status: 'success', product, error: null, barcode });
      } catch (err) {
        if (controller.signal.aborted) return; 
        setState({ status: 'error', product: null, error: err, barcode });
      }
    }

    load();
    return () => controller.abort();
  }, [barcode, retryCount]);

  if (state.barcode !== barcode) {
    return { status: 'loading', product: null, error: null, retry: () => {} };
  }
  return { ...state, retry: () => setRetryCount((n) => n + 1) };
}
