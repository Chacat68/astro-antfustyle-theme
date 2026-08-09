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
import { unified } from '@astrojs/markdown-remark'

import { remarkPlugins, rehypePlugins } from './plugins'
import { SITE } from './src/config'
import { getAbsoluteSiteUrl, shouldIncludeInSitemap } from './src/utils/seo'

const markdownExtensions = new Set(['.md', '.mdx'])
const englishBlogIds = collectMarkdownContentIds(
  fileURLToPath(new URL('./src/content/blog/en', import.meta.url))
)

// 仅列入可索引英文路由；noindex 页（如 /en/shorts/）勿加入 sitemap
const englishStaticRoutePaths = [
  '/en/',
  '/en/blog/',
  '/en/friends/',
  '/en/photos/',
  '/en/gallery/',
  '/en/projects/',
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

    // 与 Astro content id / 实际路由对齐：glob loader 会把 id 规范为小写
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
const aiCrawlerUserAgents = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
]

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE.website,
  base: SITE.base,
  build: {
    inlineStylesheets: 'never',
  },
  i18n: {
    // 默认语言使用根路径，英文使用 /en 前缀
    locales: ['zh', 'en'],
    defaultLocale: 'zh',
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
      policy: [
        ...aiCrawlerUserAgents.map((userAgent) => ({
          userAgent,
          allow: '/',
        })),
        { userAgent: '*', allow: '/' },
      ],
    }),
    unocss({ injectReset: true }),
    astroExpressiveCode(),
    mdx(),
  ],
  prerenderConflictBehavior: 'error',
  markdown: {
    syntaxHighlight: false,
    processor: unified({
      remarkPlugins,
      rehypePlugins,
    }),
  },
  image: {
    domains: SITE.imageDomains,
    layout: 'constrained',
    responsiveStyles: true,
  },
  security: {
    // 允许 Giscus 在 Astro 开发请求过滤器中加载主题样式
    allowedDomains: [
      {
        hostname: 'giscus.app',
        protocol: 'https',
      },
    ],
  },
  vite: {
    logLevel: 'warn',
    build: { chunkSizeWarningLimit: 700 },
    server: {
      headers: {
        'Access-Control-Allow-Origin': 'https://giscus.app',
      },
    },
  },
  experimental: {
    contentIntellisense: true,
    chromeDevtoolsWorkspace: true,
  },
})
