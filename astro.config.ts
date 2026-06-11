import { readdirSync } from 'node:fs'
import type { Dirent } from 'node:fs'
import { extname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import robotsTxt from 'astro-robots-txt'
import unocss from 'unocss/astro'
import astroExpressiveCode from 'astro-expressive-code'
import mdx from '@astrojs/mdx'

import { remarkPlugins, rehypePlugins } from './plugins'
import { SITE } from './src/config'
import {
  getAbsoluteSiteUrl,
  shouldIncludeInSitemap,
} from './src/utils/seo'
const markdownExtensions = new Set(['.md', '.mdx'])
const englishBlogIds = collectMarkdownContentIds(
  fileURLToPath(new URL('./src/content/blog/en', import.meta.url))
)
const englishStaticRoutePaths = [
  '/en/',
  '/en/blog/',
  '/en/friends/',
  '/en/photos/',
  '/en/gallery/',
  '/en/projects/',
  '/en/shorts/',
]
const customSitemapPages = Array.from(
  new Set([
    ...englishStaticRoutePaths.map((routePath) =>
      getAbsoluteSiteUrl(routePath)
    ),
    ...Array.from(englishBlogIds)
      .sort()
      .map((id) => getAbsoluteSiteUrl(`/en/blog/${id}/`)),
  ])
)

function collectMarkdownContentIds(
  directory: string,
  baseDirectory = directory,
  contentIds = new Set<string>()
) {
  let entries: Dirent<string>[]
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return contentIds
  }

  for (const entry of entries) {
    if (entry.name.startsWith('_')) continue

    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      collectMarkdownContentIds(entryPath, baseDirectory, contentIds)
      continue
    }

    const extension = extname(entry.name)
    if (!markdownExtensions.has(extension)) continue

    const relativePath = relative(baseDirectory, entryPath)
      .split(sep)
      .join('/')
      .replace(/\.mdx?$/, '')
      .toLowerCase()
    contentIds.add(relativePath)
  }

  return contentIds
}

const sitemapURL = new URL('sitemap-index.xml', SITE.website).href
const siteHost = new URL(SITE.website).host

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE.website,
  base: SITE.base,
  i18n: {
    // Default language lives at root (e.g. /blog), non-default languages are prefixed (e.g. /en/blog)
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
    // Generate /en/* routes by rewriting to zh content until translations exist
    fallback: {
      en: 'zh',
    },
    routing: {
      prefixDefaultLocale: false,
      fallbackType: 'rewrite',
    },
  },
  integrations: [
    sitemap({
      filter: (page) => shouldIncludeInSitemap(page, englishBlogIds),
      customPages: customSitemapPages,
      i18n: {
        defaultLocale: 'zh',
        locales: {
          zh: 'zh-CN',
          en: 'en',
        },
      },
    }),
    robotsTxt({
      host: siteHost,
      sitemap: sitemapURL,
      policy: [{ userAgent: '*', allow: '/' }],
    }),
    unocss({ injectReset: true }),
    astroExpressiveCode(),
    mdx(),
  ],
  markdown: {
    syntaxHighlight: false,
    remarkPlugins,
    rehypePlugins,
  },
  image: {
    domains: SITE.imageDomains,
    // https://docs.astro.build/en/guides/images/#responsive-image-behavior
    // Used for all local (except `/public`) and authorized remote images using `![]()` syntax; not configurable per-image
    // Used for all `<Image />` and `<Picture />` components unless overridden with `layout` prop
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    server: {
      headers: {
        // Enable CORS for dev: allow Giscus iframe to load local styles
        'Access-Control-Allow-Origin': '*',
      },
    },
    build: { chunkSizeWarningLimit: 700 },
  },
  // https://docs.astro.build/en/reference/experimental-flags/
  experimental: {
    contentIntellisense: true,
    preserveScriptOrder: true,
    headingIdCompat: true,
    chromeDevtoolsWorkspace: true,
    failOnPrerenderConflict: true,
  },
})
