/**
 * useI18n - React hook for internationalization
 *
 * Usage:
 * ```tsx
 * const { t, locale, setLocale } = useI18n();
 * <Text>{t.common.loading}</Text>
 * ```
 */

import {
  getDeviceCurrency,
  getDeviceRegion,
  getLocale,
  getSupportedLocales,
  t as getTranslations,
  setLocale as setI18nLocale,
  type SupportedLocale,
  type Translations,
} from "@/lib/i18n";
import { useCallback, useSyncExternalStore } from "react";

// Simple store for locale changes
let listeners: Array<() => void> = [];

function subscribe(callback: () => void) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
}

function notifyListeners() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return getLocale();
}

export function useI18n() {
  // Subscribe to locale changes
  const locale = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Memoized setLocale that also notifies listeners
  const setLocale = useCallback((newLocale: SupportedLocale) => {
    setI18nLocale(newLocale);
    notifyListeners();
  }, []);

  return {
    /** Current translations object */
    t: getTranslations(),
    /** Current locale code (e.g., 'en', 'pt') */
    locale,
    /** Set the locale manually */
    setLocale,
    /** List of all supported locales with labels */
    supportedLocales: getSupportedLocales(),
    /** Device's region code (e.g., 'US', 'BR') */
    region: getDeviceRegion(),
    /** Device's detected currency (e.g., 'USD', 'EUR') */
    currency: getDeviceCurrency(),
  };
}

// Re-export types for convenience
export type { SupportedLocale, Translations };
