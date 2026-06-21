import { getCollection } from 'astro:content'

import {
  buildGalleryData,
  computeGalleryHash,
  createGalleryResponse,
} from '~/utils/gallery-json'

import type { APIRoute } from 'astro'

const CACHE_PATH = './node_modules/.astro/ai-gallery/'

const entries = (await getCollection('aiGallery')).map((p) => ({
  id: p.data.id,
  desc: p.data.desc,
  ...(p.data.tags.length ? { tags: p.data.tags } : {}),
}))

export const hash = computeGalleryHash(entries)
export const tags = Array.from(
  new Set(entries.flatMap((entry) => entry.tags ?? []))
)

const data = await buildGalleryData({
  entries,
  localImages: import.meta.glob<{ default: ImageMetadata }>(
    '/src/content/ai-gallery/**/*.{jpg,jpeg,png,webp,avif}'
  ),
  cachePath: CACHE_PATH,
  logPrefix: `gallery.${hash}.json.ts`,
})

export const GET: APIRoute = ({ params }) => {
  return createGalleryResponse(params.hash, data)
}

export async function getStaticPaths() {
  return [{ params: { hash } }]
}
