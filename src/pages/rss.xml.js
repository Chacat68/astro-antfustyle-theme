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
  const blog = await getCollection('blog')

  const filteredBlogitems = blog.filter((item) => !item.data.draft)

  const sortedBlogItems = filteredBlogitems.sort(
    (a, b) => new Date(b.data.pubDate) - new Date(a.data.pubDate)
  )

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: getAbsoluteSiteUrl('/'),
    customData: `
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <image>
        <title>${SITE.title}</title>
        <url>${getAbsoluteSiteUrl('/icon-512.png')}</url>
        <link>${getAbsoluteSiteUrl('/')}</link>
      </image>`,

    items: sortedBlogItems.map((item) => ({
      title: `${item.data.title}`,
      link: getAbsoluteSiteUrl(`/blog/${item.id}/`),
      pubDate: item.data.pubDate,
      description: item.data.description,
      author: SITE.author,
    })),

    stylesheet: getAbsoluteSiteUrl('/rss-styles.xsl'),
  })
}
