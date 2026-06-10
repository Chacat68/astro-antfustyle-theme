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
}))

export const hash = computeGalleryHash(entries)

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
