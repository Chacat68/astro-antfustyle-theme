import type { AppLocale } from './locales'

export function localeToHtmlLang(locale: AppLocale): string {
  switch (locale) {
    case 'zh':
      return 'zh-CN'
    case 'en':
      return 'en'
  }
}

export function localeToOgLocale(locale: AppLocale): string {
  switch (locale) {
    case 'zh':
      return 'zh_CN'
    case 'en':
      return 'en_US'
  }
}

export function localeToGiscusLang(locale: AppLocale): string {
  // https://giscus.app/ supported language codes are like: en, zh-CN, ...
  switch (locale) {
    case 'zh':
      return 'zh-CN'
    case 'en':
      return 'en'
  }
}
