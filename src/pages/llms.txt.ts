import { getCollection } from 'astro:content'

import { SITE } from '~/config'
import { getAbsoluteSiteUrl } from '~/utils/seo'

import type { CollectionEntry } from 'astro:content'

export const prerender = true

type BlogEntry = CollectionEntry<'blog'> | CollectionEntry<'blog_en'>

function normalizeMarkdownText(value: string) {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeMarkdownLabel(value: string) {
  return normalizeMarkdownText(value).replace(/([\\[\]])/g, '\\$1')
}

function formatPostLink(post: BlogEntry, locale: 'zh' | 'en') {
  const localePrefix = locale === 'en' ? '/en' : ''
  const markdownURL = getAbsoluteSiteUrl(
    `${localePrefix}/blog/${post.id}/index.html.md`
  )
  const description = normalizeMarkdownText(post.data.description)
  const detail = description ? `: ${description}` : ''

  return `- [${escapeMarkdownLabel(post.data.title)}](${markdownURL})${detail}`
}

function byPublishedDateDescending(a: BlogEntry, b: BlogEntry) {
  return (b.data.pubDate?.valueOf() ?? 0) - (a.data.pubDate?.valueOf() ?? 0)
}

async function getPublishedPosts(collection: 'blog' | 'blog_en') {
  const posts = await getCollection(collection, ({ data }) => !data.draft)
  return posts.sort(byPublishedDateDescending)
}

export async function GET() {
  const [zhPosts, enPosts] = await Promise.all([
    getPublishedPosts('blog'),
    getPublishedPosts('blog_en'),
  ])

  const content = [
    `# ${SITE.title}`,
    '',
    `> ${normalizeMarkdownText(SITE.description)}`,
    '',
    `This is the personal website and blog of ${SITE.author}. Prefer the Markdown article links below when retrieving article text. Canonical HTML pages remain the source of record.`,
    '',
    '## Main pages',
    '',
    `- [Home](${getAbsoluteSiteUrl('/')}): Site introduction and latest posts.`,
    `- [Blog](${getAbsoluteSiteUrl('/blog/')}): Complete Chinese article archive.`,
    `- [English blog](${getAbsoluteSiteUrl('/en/blog/')}): Complete English article archive.`,
    `- [Projects](${getAbsoluteSiteUrl('/projects/')}): Selected projects and work.`,
    `- [Photos](${getAbsoluteSiteUrl('/photos/')}): Photography collection.`,
    `- [AI gallery](${getAbsoluteSiteUrl('/gallery/')}): AI-assisted visual work.`,
    '',
    '## Chinese articles',
    '',
    ...zhPosts.map((post) => formatPostLink(post, 'zh')),
    '',
    '## English articles',
    '',
    ...enPosts.map((post) => formatPostLink(post, 'en')),
    '',
    '## Feeds and discovery',
    '',
    `- [RSS feed](${getAbsoluteSiteUrl('/rss.xml')}): Latest Chinese posts in publication order.`,
    `- [English RSS feed](${getAbsoluteSiteUrl('/en/rss.xml')}): Latest English posts in publication order.`,
    `- [XML sitemap](${getAbsoluteSiteUrl('/sitemap-index.xml')}): Canonical indexable HTML URLs.`,
    '',
  ].join('\n')

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
