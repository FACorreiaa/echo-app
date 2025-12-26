import '../tamagui-web.css'

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { tamaguiConfig } from '../tamagui.config'
import { persistOptions, queryClient } from '@/lib/query/query-client'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </TamaguiProvider>
    </PersistQueryClientProvider>
  )
}
