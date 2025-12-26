/**
 * ThemeContext - Manages theme state with persistence
 * Supports 'light', 'dark', or 'system' preferences
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  /** Current theme preference ('light' | 'dark' | 'system') */
  themeMode: ThemeMode;
  /** Resolved theme based on preference and system settings */
  resolvedTheme: ResolvedTheme;
  /** Whether theme is light mode */
  isLight: boolean;
  /** Whether theme is dark mode */
  isDark: boolean;
  /** Set theme preference */
  setTheme: (mode: ThemeMode) => void;
  /** Toggle between light and dark (ignores system) */
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = "@echo_theme_preference";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    async function loadTheme() {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setThemeMode(saved);
        }
      } catch (error) {
        console.warn("Failed to load theme preference:", error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  // Resolve the actual theme based on preference
  const resolvedTheme: ResolvedTheme =
    themeMode === "system" ? (systemColorScheme ?? "dark") : themeMode;

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeMode(mode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        resolvedTheme,
        isLight: resolvedTheme === "light",
        isDark: resolvedTheme === "dark",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Re-export for convenience
export type { ResolvedTheme, ThemeMode };
