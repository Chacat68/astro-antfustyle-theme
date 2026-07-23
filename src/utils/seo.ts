import { SITE } from '../config'

/** Routes excluded from sitemap and marked noindex in page head. */
export const NOINDEX_ROUTE_PATHS = new Set([
  '/404/',
  '/feeds/',
  '/highlights/',
  '/prs/',
  '/releases/',
  '/shorts/',
  '/streams/',
])

export const META_DESCRIPTION_MAX_LENGTH = 160
export const META_TITLE_SOFT_MAX_LENGTH = 60

export function getConfiguredBasePath(base = SITE.base) {
  const trimmedBase = base.replace(/^\/+|\/+$/g, '')
  return trimmedBase ? `/${trimmedBase}/` : '/'
}

export function normalizeRoutePath(
  pathname: string,
  basePath = getConfiguredBasePath()
) {
  let routePath = pathname
  if (basePath !== '/' && routePath.startsWith(basePath)) {
    routePath = `/${routePath.slice(basePath.length)}`
  }

  routePath = routePath.replace(/\/+/g, '/')
  if (!routePath.startsWith('/')) routePath = `/${routePath}`
  return routePath.endsWith('/') ? routePath : `${routePath}/`
}

export function isNoindexRoute(routePath: string) {
  if (NOINDEX_ROUTE_PATHS.has(routePath)) return true
  if (!routePath.startsWith('/en/')) return false

  const unprefixedRoutePath = routePath.replace(/^\/en/, '') || '/'
  return NOINDEX_ROUTE_PATHS.has(unprefixedRoutePath)
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

  const sentencePattern = /[^.!?。！？]+[.!?。！？]+/gu
  const sentences = normalized.match(sentencePattern) || []
  let assembled = ''
  for (const sentence of sentences) {
    const candidate = `${assembled}${sentence}`.trim()
    if (candidate.length <= maxLength) assembled = candidate
    else break
  }
  if (assembled.length >= Math.min(50, maxLength * 0.5)) return assembled

  const prefersChinese = /[\u4e00-\u9fff]/u.test(normalized)
  const truncated = normalized.slice(0, maxLength - 1)
  const separators = prefersChinese
    ? ['。', '！', '？', '；', '，', ' ']
    : ['. ', '! ', '? ', '; ', ', ', ' ']

  for (const separator of separators) {
    const index = truncated.lastIndexOf(separator)
    if (index > maxLength * 0.55) {
      const cut = truncated
        .slice(0, index + (separator.trim() ? separator.length : 0))
        .trim()
        .replace(/[,:;，；、]+$/u, '')
      if (/[.!?。！？]$/u.test(cut)) return cut
      return `${cut}${prefersChinese ? '。' : '.'}`
    }
  }

  return `${truncated.trimEnd()}${prefersChinese ? '。' : '.'}`
}

export function isMissingEnglishBlogTranslation(
  routePath: string,
  englishBlogIds: ReadonlySet<string>
) {
  const match = routePath.match(/^\/en\/blog\/(.+)\/$/)
  if (!match) return false

  return !englishBlogIds.has(decodeURIComponent(match[1]))
}

export function shouldIncludeInSitemap(
  page: string,
  englishBlogIds: ReadonlySet<string>
) {
  const routePath = normalizeRoutePath(new URL(page).pathname)

  // Alternate machine-readable representations are discovered from HTML and
  // llms.txt; the XML sitemap remains a canonical HTML URL inventory.
  if (routePath === '/llms.txt/' || routePath.endsWith('/index.html.md/')) {
    return false
  }
  if (isNoindexRoute(routePath)) return false
  if (isMissingEnglishBlogTranslation(routePath, englishBlogIds)) return false
  return true
}
