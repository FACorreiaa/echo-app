/**
 * React Query Client with AsyncStorage Persistence
 * Caches API responses across app restarts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import type { AppStateStatus } from 'react-native';
import { AppState } from 'react-native';

// Create the query client
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache data for 5 minutes by default
            staleTime: 1000 * 60 * 5,
            // Keep unused data in cache for 24 hours
            gcTime: 1000 * 60 * 60 * 24,
            // Retry failed requests 2 times
            retry: 2,
            // Don't refetch on window focus by default (we handle this manually)
            refetchOnWindowFocus: false,
        },
        mutations: {
            // Retry mutations once
            retry: 1,
        },
    },
});

// Create AsyncStorage persister for offline support
export const asyncStoragePersister = createAsyncStoragePersister({
    storage: AsyncStorage,
    key: 'ECHO_QUERY_CACHE',
    // Throttle persistence writes
    throttleTime: 1000,
});

// Persistence options
export const persistOptions = {
    persister: asyncStoragePersister,
    // Maximum age of persisted cache (24 hours)
    maxAge: 1000 * 60 * 60 * 24,
    // Buster to invalidate cache on app updates
    buster: 'v1',
};

/**
 * Set up app state change listener for refetching
 * Call this once in your app's root component
 */
export function setupAppStateRefresh() {
    let appState = AppState.currentState;

    const listener = (nextAppState: AppStateStatus) => {
        // Refetch when app comes to foreground
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
            queryClient.invalidateQueries();
        }
        appState = nextAppState;
    };

    const subscription = AppState.addEventListener('change', listener);

    return () => {
        subscription.remove();
    };
}

// Query keys factory for type-safe keys
export const queryKeys = {
    auth: {
        all: ['auth'] as const,
        user: () => [...queryKeys.auth.all, 'user'] as const,
    },
    // Add more domain keys here as needed
} as const;
