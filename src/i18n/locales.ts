export const APP_LOCALES = ['zh', 'en'] as const

export type AppLocale = (typeof APP_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'zh'

export function isAppLocale(value: unknown): value is AppLocale {
  return (
    typeof value === 'string' &&
    (APP_LOCALES as readonly string[]).includes(value)
  )
}

/** 是否为默认语言（默认语言路由不带前缀） */
export function isDefaultLocale(locale: AppLocale): boolean {
  return locale === DEFAULT_LOCALE
}

/** 双语场景下获取另一种语言（语言切换按钮等使用） */
export function getAlternateLocale(locale: AppLocale): AppLocale {
  return APP_LOCALES.find((l) => l !== locale) ?? DEFAULT_LOCALE
}

/**
 * 从「中文默认 + 可选英文」字段中取出当前语言的值。
 * 用于 projects/friends 等 data.json 的 desc/descEn、category/categoryEn 模式。
 */
export function pickLocalized(
  locale: AppLocale,
  zhValue: string,
  enValue?: string
): string {
  return !isDefaultLocale(locale) && enValue ? enValue : zhValue
}
