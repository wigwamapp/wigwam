import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: true,
      staleTime: 3_600_000,
      cacheTime: Infinity,
      refetchInterval: false,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retryOnMount: true,
      // suspense: true,
      onError: (error) => {
        //
      },
    },
    mutations: {
      onError: (error) => {
        //
      },
    },
  },
});
