import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'

import { SITE } from '~/config'
import { withBasePath } from '~/utils/path'

function getAbsoluteSiteUrl(path) {
  const url = new URL(withBasePath(path), SITE.website)
  url.protocol = 'https:'
  return url.href
}

export async function GET() {
  const blog = await getCollection('blog_en')
  const filteredBlogItems = blog.filter((item) => !item.data.draft)
  const sortedBlogItems = filteredBlogItems.sort(
    (a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate)
  )

  return rss({
    title: `${SITE.title} (English)`,
    description: SITE.description,
    site: getAbsoluteSiteUrl('/en/'),
    customData: `
      <language>en</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <image>
        <title>${SITE.title}</title>
        <url>${getAbsoluteSiteUrl('/icon-512.png')}</url>
        <link>${getAbsoluteSiteUrl('/en/')}</link>
      </image>`,
    items: sortedBlogItems.map((item) => ({
      title: `${item.data.title}`,
      link: getAbsoluteSiteUrl(`/en/blog/${item.id}/`),
      pubDate: item.data.pubDate,
      description: item.data.description,
      author: SITE.author,
    })),
    stylesheet: getAbsoluteSiteUrl('/rss-styles.xsl'),
  })
}
