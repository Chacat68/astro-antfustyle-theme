import { SITE } from '~/config'
import { getAbsoluteSiteUrl } from '~/utils/seo'

import type { CollectionEntry } from 'astro:content'

type BlogEntry = CollectionEntry<'blog'> | CollectionEntry<'blog_en'>

function formatDate(date: Date | '' | undefined) {
  return date instanceof Date ? date.toISOString().slice(0, 10) : undefined
}

function normalizeSummary(value: string) {
  return value
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function createMarkdownPostResponse(post: BlogEntry) {
  const isEnglish = post.collection === 'blog_en'
  const published = formatDate(post.data.pubDate)
  const modified = formatDate(post.data.lastModDate) ?? published
  const canonicalURL = getAbsoluteSiteUrl(
    `${isEnglish ? '/en' : ''}/blog/${post.id}/`
  )
  const body = post.body?.trim() ?? ''
  const content = [
    `# ${post.data.title}`,
    '',
    post.data.description ? `> ${normalizeSummary(post.data.description)}` : '',
    '',
    `- Author: ${SITE.author}`,
    published ? `- Published: ${published}` : '',
    modified ? `- Last modified: ${modified}` : '',
    `- Canonical: ${canonicalURL}`,
    post.data.category ? `- Category: ${post.data.category}` : '',
    post.data.tags.length > 0 ? `- Tags: ${post.data.tags.join(', ')}` : '',
    '',
    body,
    '',
  ]
    .filter((line, index, lines) => line || lines[index - 1] !== '')
    .join('\n')

  return new Response(content, {
    headers: {
      'Content-Language': isEnglish ? 'en' : SITE.lang,
      'Content-Type': 'text/markdown; charset=utf-8',
      'Link': `<${canonicalURL}>; rel="canonical"`,
    },
  })
}
