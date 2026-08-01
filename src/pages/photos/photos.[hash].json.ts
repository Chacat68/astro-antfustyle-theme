import { getCollection } from 'astro:content'

import {
  buildGalleryData,
  computeGalleryHash,
  createGalleryResponse,
} from '~/utils/gallery-json'

import type { APIRoute } from 'astro'

const CACHE_PATH = './node_modules/.astro/photos/'

// file loader 会按 entry id（即图片 URL/路径）升序返回，COS 时间戳文件名会把新图排到末尾。
// 这里按 id 降序，让新上传的照片出现在相册前面。
const photos = (await getCollection('photos'))
  .map((p) => ({
    id: p.data.id,
    desc: p.data.desc,
  }))
  .sort((a, b) => b.id.localeCompare(a.id))

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
