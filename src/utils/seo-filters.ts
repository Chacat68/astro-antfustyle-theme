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

export function normalizeRoutePath(pathname: string, basePath = '/') {
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

export function isMissingEnglishBlogTranslation(
  routePath: string,
  englishBlogIds: ReadonlySet<string>
) {
  const match = routePath.match(/^\/en\/blog\/(.+)\/$/)
  if (!match) return false

  return !englishBlogIds.has(decodeURIComponent(match[1]))
}

/** Changelog 仅有中文内容；英文路由为 rewrite fallback，应 noindex 且不进 sitemap。 */
export function isEnglishChangelogFallback(routePath: string) {
  return (
    routePath === '/en/changelog/' || routePath.startsWith('/en/changelog/')
  )
}

export function shouldIncludeRouteInSitemap(
  routePath: string,
  englishBlogIds: ReadonlySet<string>
) {
  // Alternate machine-readable representations are discovered from HTML and
  // llms.txt; the XML sitemap remains a canonical HTML URL inventory.
  if (routePath === '/llms.txt/' || routePath.endsWith('/index.html.md/')) {
    return false
  }
  if (isNoindexRoute(routePath)) return false
  if (isEnglishChangelogFallback(routePath)) return false
  if (isMissingEnglishBlogTranslation(routePath, englishBlogIds)) return false
  return true
}
