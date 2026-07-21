import { SITE } from '../config'
import {
  isEnglishChangelogFallback,
  isMissingEnglishBlogTranslation,
  isNoindexRoute,
  NOINDEX_ROUTE_PATHS,
  normalizeRoutePath,
  shouldIncludeRouteInSitemap,
} from './seo-filters'

export {
  isEnglishChangelogFallback,
  isMissingEnglishBlogTranslation,
  isNoindexRoute,
  NOINDEX_ROUTE_PATHS,
  normalizeRoutePath,
}

export const META_DESCRIPTION_MAX_LENGTH = 160
export const META_TITLE_SOFT_MAX_LENGTH = 60

export function getConfiguredBasePath(base = SITE.base) {
  const trimmedBase = base.replace(/^\/+|\/+$/g, '')
  return trimmedBase ? `/${trimmedBase}/` : '/'
}

export function getAbsoluteSiteUrl(routePath: string) {
  const basePath = getConfiguredBasePath()
  const pathname = `${basePath}${routePath.replace(/^\/+/, '')}`.replace(
    /\/+/g,
    '/'
  )
  const url = new URL(pathname, SITE.website)
  url.protocol = 'https:'
  return url.href
}

export function formatPageTitle(
  title: string | undefined,
  siteTitle: string,
  maxLength = META_TITLE_SOFT_MAX_LENGTH
) {
  if (!title || title === siteTitle) return siteTitle

  const suffix = ` - ${siteTitle}`
  const fullTitle = `${title}${suffix}`
  if (fullTitle.length <= maxLength) return fullTitle

  const titleBudget = Math.max(maxLength - suffix.length - 1, 20)
  const shortenedTitle =
    title.length > titleBudget
      ? `${title.slice(0, titleBudget).trimEnd()}…`
      : title

  return `${shortenedTitle}${suffix}`
}

export function truncateMetaDescription(
  description: string,
  maxLength = META_DESCRIPTION_MAX_LENGTH
) {
  const normalized = description.trim().replace(/\s+/g, ' ')
  if (normalized.length <= maxLength) return normalized

  const truncated = normalized.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.6) {
    return `${truncated.slice(0, lastSpace).trimEnd()}…`
  }

  return `${truncated.trimEnd()}…`
}

export function shouldIncludeInSitemap(
  page: string,
  englishBlogIds: ReadonlySet<string>
) {
  const routePath = normalizeRoutePath(
    new URL(page).pathname,
    getConfiguredBasePath()
  )
  return shouldIncludeRouteInSitemap(routePath, englishBlogIds)
}
