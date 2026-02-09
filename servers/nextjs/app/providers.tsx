'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';

/**
 * Intercept browser-side fetch calls to /api/v1/ and inject the
 * X-API-Key header so Presenton's own frontend can authenticate
 * against the FastAPI middleware when AHLAN_API_KEY is configured.
 */
function useApiKeyInterceptor() {
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_AHLAN_API_KEY;
    if (!apiKey) return;

    const originalFetch = window.fetch;
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.startsWith('/api/v1/')) {
        const headers = new Headers(init?.headers);
        if (!headers.has('X-API-Key')) {
          headers.set('X-API-Key', apiKey);
        }
        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  useApiKeyInterceptor();

  return <Provider store={store}>
      {children}
  </Provider>;
}
