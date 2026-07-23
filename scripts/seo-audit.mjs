#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import chalk from 'chalk'

const DIST_DIR = 'dist'
const SITE_HOST = 'foo-z.com'
const AI_CRAWLER_USER_AGENTS = [
  'OAI-SearchBot',
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'Google-Extended',
]
function decodeHtmlEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

const REQUIRED_META = [
  'title',
  'description',
  'canonical',
  'ogTitle',
  'ogImage',
  'robots',
  'ldjson',
]

const META_PATTERNS = {
  title: /<title>([^<]+)<\/title>/,
  description: /<meta name="description" content="([^"]+)"/,
  canonical: /<link rel="canonical" href="([^"]+)"/,
  ogTitle: /<meta property="og:title" content="([^"]+)"/,
  ogImage: /<meta property="og:image" content="([^"]+)"/,
  robots: /<meta name="robots" content="([^"]+)"/,
  ldjson: /<script[^>]*type="application\/ld\+json"/,
}

function walkHtmlFiles(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      walkHtmlFiles(entryPath, files)
      continue
    }
    if (entry.name === 'index.html') files.push(entryPath)
  }
  return files
}

function walkFilesNamed(directory, fileName, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      walkFilesNamed(entryPath, fileName, files)
      continue
    }
    if (entry.name === fileName) files.push(entryPath)
  }
  return files
}

function parsePageMeta(html) {
  const meta = {}
  for (const [key, pattern] of Object.entries(META_PATTERNS)) {
    const match = html.match(pattern)
    meta[key] = match ? match[1] || true : null
  }
  meta.hreflangCount = (html.match(/<link rel="alternate" hreflang=/g) || [])
    .length
  return meta
}

function isIndexable(robots) {
  return !robots || !robots.includes('noindex')
}

function auditDist() {
  const htmlFiles = walkHtmlFiles(DIST_DIR)
  const errors = []
  const warnings = []

  const titles = new Map()
  const descriptions = new Map()

  for (const file of htmlFiles) {
    const rel = file.slice(`${DIST_DIR}/`.length)
    const html = readFileSync(file, 'utf8')
    const meta = parsePageMeta(html)

    const missing = REQUIRED_META.filter((key) => !meta[key])
    if (missing.length > 0) {
      errors.push(`${rel}: 缺少 ${missing.join(', ')}`)
    }

    if (meta.canonical && !meta.canonical.startsWith(`https://${SITE_HOST}`)) {
      errors.push(`${rel}: canonical 不是 https://${SITE_HOST} 域名`)
    }

    if (!isIndexable(meta.robots)) continue

    const decodedTitle = meta.title ? decodeHtmlEntities(meta.title) : null
    const decodedDescription = meta.description
      ? decodeHtmlEntities(meta.description)
      : null

    if (decodedTitle) {
      if (!titles.has(decodedTitle)) titles.set(decodedTitle, [])
      titles.get(decodedTitle).push(rel)
      if (decodedTitle.length > 60) {
        warnings.push(`${rel}: title 长度 ${decodedTitle.length}（建议 ≤ 60）`)
      }
    }

    if (decodedDescription) {
      if (!descriptions.has(decodedDescription)) {
        descriptions.set(decodedDescription, [])
      }
      descriptions.get(decodedDescription).push(rel)
      if (decodedDescription.length > 160) {
        warnings.push(
          `${rel}: description 长度 ${decodedDescription.length}（建议 ≤ 160）`
        )
      }
      if (decodedDescription.length < 50) {
        warnings.push(
          `${rel}: description 长度 ${decodedDescription.length}（建议 ≥ 50）`
        )
      }

      const weakTrailing = new Set([
        'a',
        'an',
        'the',
        'and',
        'or',
        'of',
        'to',
        'in',
        'on',
        'at',
        'for',
        'with',
        'from',
        'into',
        'about',
        'as',
        'its',
        'feature',
      ])
      const trailingToken = decodedDescription
        .replace(/[.!?。！？"'\u201d\u2019]+$/u, '')
        .match(/[A-Za-z]+(?:'[A-Za-z]+)?$/u)?.[0]
        ?.toLowerCase()
      if (trailingToken && weakTrailing.has(trailingToken)) {
        warnings.push(
          `${rel}: description 以弱尾词「${trailingToken}」收尾，疑似半截句`
        )
      }
      const openParens = (decodedDescription.match(/[（([]/gu) || []).length
      const closeParens = (decodedDescription.match(/[）)\]]/gu) || []).length
      if (openParens > closeParens) {
        warnings.push(`${rel}: description 存在未闭合括号`)
      }
    }
  }

  for (const [title, pages] of titles.entries()) {
    if (pages.length > 1) {
      warnings.push(
        `重复 title「${title}」出现在 ${pages.length} 个页面：${pages.join(', ')}`
      )
    }
  }

  for (const [description, pages] of descriptions.entries()) {
    if (pages.length > 1) {
      const preview =
        description.length > 48 ? `${description.slice(0, 48)}…` : description
      warnings.push(
        `重复 description「${preview}」出现在 ${pages.length} 个页面`
      )
    }
  }

  const robotsPath = join(DIST_DIR, 'robots.txt')
  if (!existsSync(robotsPath)) {
    errors.push('缺少 dist/robots.txt')
  } else {
    const robots = readFileSync(robotsPath, 'utf8')
    if (!robots.includes(`Sitemap: https://${SITE_HOST}/sitemap-index.xml`)) {
      errors.push('robots.txt 未指向正确的 sitemap-index.xml')
    }
    for (const userAgent of AI_CRAWLER_USER_AGENTS) {
      if (!robots.includes(`User-agent: ${userAgent}\nAllow: /`)) {
        errors.push(`robots.txt 未明确允许 ${userAgent}`)
      }
    }
  }

  const llmsPath = join(DIST_DIR, 'llms.txt')
  if (!existsSync(llmsPath)) {
    errors.push('缺少 dist/llms.txt')
  } else {
    const llms = readFileSync(llmsPath, 'utf8')
    if (!llms.startsWith('# ') || !llms.includes('## Chinese articles')) {
      errors.push('llms.txt 缺少站点标题或中文文章索引')
    }

    const markdownLinks = Array.from(
      llms.matchAll(
        new RegExp(
          `https://${SITE_HOST}(/(?:en/)?blog/[^)]+/index\\.html\\.md)`,
          'g'
        )
      ),
      (match) => match[1]
    )
    if (markdownLinks.length === 0) {
      errors.push('llms.txt 未包含文章 Markdown 链接')
    }
    for (const pathname of markdownLinks) {
      if (!existsSync(join(DIST_DIR, pathname))) {
        errors.push(`llms.txt 指向不存在的 Markdown：${pathname}`)
      }
    }
  }

  const markdownFiles = walkFilesNamed(DIST_DIR, 'index.html.md')
  if (markdownFiles.length === 0) {
    errors.push('未生成文章 Markdown 端点')
  }
  for (const markdownFile of markdownFiles) {
    const htmlFile = markdownFile.replace(/index\.html\.md$/, 'index.html')
    if (!existsSync(htmlFile)) {
      errors.push(`${markdownFile}: 缺少对应 canonical HTML`)
      continue
    }

    const markdownPath = markdownFile.slice(DIST_DIR.length)
    const html = readFileSync(htmlFile, 'utf8')
    const alternateLink = `<link rel="alternate" type="text/markdown" href="https://${SITE_HOST}${markdownPath}"`
    if (!html.includes(alternateLink)) {
      errors.push(`${htmlFile}: 缺少 Markdown alternate link`)
    }
  }

  const sitemapIndexPath = join(DIST_DIR, 'sitemap-index.xml')
  if (!existsSync(sitemapIndexPath)) {
    errors.push('缺少 dist/sitemap-index.xml')
  }

  const sitemapPath = join(DIST_DIR, 'sitemap-0.xml')
  let sitemapUrlCount = 0
  if (existsSync(sitemapPath)) {
    const sitemap = readFileSync(sitemapPath, 'utf8')
    sitemapUrlCount = (sitemap.match(/<loc>/g) || []).length
    if (sitemap.includes('llms.txt') || sitemap.includes('index.html.md')) {
      errors.push('sitemap 不应包含非 canonical 的 AI 抓取端点')
    }
  } else {
    errors.push('缺少 dist/sitemap-0.xml')
  }

  const indexableCount = htmlFiles.filter((file) => {
    const html = readFileSync(file, 'utf8')
    const meta = parsePageMeta(html)
    return isIndexable(meta.robots)
  }).length

  const noindexCount = htmlFiles.length - indexableCount

  return {
    htmlFiles,
    indexableCount,
    noindexCount,
    sitemapUrlCount,
    markdownCount: markdownFiles.length,
    errors,
    warnings,
  }
}

function main() {
  if (!existsSync(DIST_DIR)) {
    console.error(
      chalk.red(
        `未找到 ${DIST_DIR}/ 目录。请先运行 pnpm build，再执行 pnpm seo:audit。`
      )
    )
    process.exit(1)
  }

  const result = auditDist()

  console.log(chalk.bold('\nSEO 审计报告'))
  console.log(`HTML 页面：${result.htmlFiles.length}`)
  console.log(`可索引页面：${result.indexableCount}`)
  console.log(`noindex 页面：${result.noindexCount}`)
  console.log(`Sitemap URL：${result.sitemapUrlCount}`)
  console.log(`文章 Markdown：${result.markdownCount}`)

  if (result.errors.length > 0) {
    console.log(chalk.red(`\n错误（${result.errors.length}）`))
    for (const error of result.errors) console.log(chalk.red(`  ✗ ${error}`))
  }

  if (result.warnings.length > 0) {
    console.log(chalk.yellow(`\n警告（${result.warnings.length}）`))
    for (const warning of result.warnings.slice(0, 30)) {
      console.log(chalk.yellow(`  ! ${warning}`))
    }
    if (result.warnings.length > 30) {
      console.log(
        chalk.yellow(`  … 另有 ${result.warnings.length - 30} 条警告未显示`)
      )
    }
  }

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log(chalk.green('\n✓ 未发现 SEO 问题'))
  } else if (result.errors.length === 0) {
    console.log(chalk.green('\n✓ 无阻塞性错误，存在可优化项'))
  }

  process.exit(result.errors.length > 0 ? 1 : 0)
}

main()
