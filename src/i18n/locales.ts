export const APP_LOCALES = ['zh', 'en'] as const

export type AppLocale = (typeof APP_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'zh'

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === 'string' &&
    (APP_LOCALES as readonly string[]).includes(value)
  )
}
