import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { persistOptions, queryClient, setupAppStateRefresh } from '@/lib/query/query-client';
import { useAuthStore, useIsAuthenticated, useIsHydrated } from '@/lib/stores/auth-store';

// Custom navigation themes matching Echo design
const EchoDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.destructive,
  },
};

const EchoLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.destructive,
  },
};

function AuthGate() {
  const isAuthenticated = useIsAuthenticated();
  const isHydrated = useIsHydrated();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const segments = useSegments();
  const router = useRouter();

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isHydrated, segments, router]);

  // Show loading while hydrating
  if (!isHydrated) {
    return null;
  }

  return <Slot />;
}

function RootLayoutNav() {
  const { resolvedTheme } = useTheme();
  const isHydrated = useIsHydrated();
  const navigationTheme = resolvedTheme === 'dark' ? EchoDarkTheme : EchoLightTheme;

  // Set up app state refresh for React Query
  useEffect(() => {
    const cleanup = setupAppStateRefresh();
    return cleanup;
  }, []);

  // Show loading screen while Zustand hydrates
  if (!isHydrated) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: navigationTheme.colors.background,
      }}>
        <ActivityIndicator size="large" color={navigationTheme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <AuthGate />
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={persistOptions}
    >
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </PersistQueryClientProvider>
  );
}
