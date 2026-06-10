import { getCollection } from 'astro:content'

import {
  buildGalleryData,
  computeGalleryHash,
  createGalleryResponse,
} from '~/utils/gallery-json'

import type { APIRoute } from 'astro'

const CACHE_PATH = './node_modules/.astro/photos/'

const photos = (await getCollection('photos')).map((p) => ({
  id: p.data.id,
  desc: p.data.desc,
}))

export const hash = computeGalleryHash(photos)

const data = await buildGalleryData({
  entries: photos,
  localImages: import.meta.glob<{ default: ImageMetadata }>(
    '/src/content/photos/**/*.{jpg,jpeg,png,webp,avif}'
  ),
  cachePath: CACHE_PATH,
  logPrefix: `photos.${hash}.json.ts`,
})

export const GET: APIRoute = ({ params }) => {
  return createGalleryResponse(params.hash, data)
}

export async function getStaticPaths() {
  return [{ params: { hash } }]
}
