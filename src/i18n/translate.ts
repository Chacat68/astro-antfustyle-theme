import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from './locales'
import { UI_STRINGS } from './ui'

export function getLocale(value: unknown): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE
}

export function t(
  locale: unknown,
  key: string,
  params?: Record<string, string | number>
): string {
  const safeLocale = getLocale(locale)

  let text =
    UI_STRINGS[safeLocale][key] ?? UI_STRINGS[DEFAULT_LOCALE][key] ?? key

  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      text = text.replaceAll(`{${paramKey}}`, String(paramValue))
    }
  }

  return text
}

export function useTranslations(locale: unknown) {
  return (key: string, params?: Record<string, string | number>) =>
    t(locale, key, params)
}
