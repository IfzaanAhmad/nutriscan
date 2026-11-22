import { useEffect } from 'react';

// Sets the browser tab title for the current page, e.g. "Compare · NutriScan",
// so each page is identifiable in tabs and history.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · NutriScan` : 'NutriScan';
  }, [title]);
}
