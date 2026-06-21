import { getCollection, getEntry } from 'astro:content'

import { createMarkdownPostResponse } from '~/utils/ai-crawl'

import type { APIContext } from 'astro'

export const prerender = true

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft)

  return posts.map((post) => ({
    params: { slug: post.id },
  }))
}

export async function GET({ params }: APIContext) {
  const slug = params.slug
  if (!slug) return new Response('Not found', { status: 404 })

  const post = await getEntry('blog', slug)
  if (!post || post.data.draft)
    return new Response('Not found', { status: 404 })

  return createMarkdownPostResponse(post)
}
