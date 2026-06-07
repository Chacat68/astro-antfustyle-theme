import crypto from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

import { getCollection } from 'astro:content'
import { shorthash } from 'astro/runtime/server/shorthash.js'

import {
  fetchRemoteImageWithSharp,
  generatePlaceholder,
  getThumbnail,
} from '~/utils/image'

import type { PhotoGalleryItem } from '~/types/photo-gallery'

import type { APIRoute } from 'astro'

const CACHE_PATH = './node_modules/.astro/ai-gallery/'
const PLACEHOLDER_PIXEL_TARGET = 100
const THUMBNAIL_WIDTH = 720

const VERSION = 1
const entries = (await getCollection('aiGallery')).map((p) => ({
  id: p.data.id,
  desc: p.data.desc,
}))

export const hash = crypto
  .createHash('sha256')
  .update(`${VERSION}-${JSON.stringify(entries)}`)
  .digest('hex')
  .slice(0, 8)

const data: PhotoGalleryItem[] = []
const localImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/ai-gallery/**/*.{jpg,jpeg,png,webp,avif}'
)
const localImageKeys = Object.keys(localImages)

for (const photo of entries) {
  const { id, desc } = photo

  if (id.startsWith('http://') || id.startsWith('https://')) {
    const uuid = shorthash(id + PLACEHOLDER_PIXEL_TARGET)
    try {
      const cache = JSON.parse(readFileSync(CACHE_PATH + uuid, 'utf-8'))
      const thumbnail = await getThumbnail(
        id,
        THUMBNAIL_WIDTH,
        cache.aspectRatio
      )
      data.push({
        uuid,
        src: id,
        desc,
        thumbnail,
        placeholder: cache.placeholder,
        aspectRatio: cache.aspectRatio,
      })
      continue
    } catch (_) {
      // ignore cache miss
    }

    const remoteImage = await fetchRemoteImageWithSharp(id)
    if (!remoteImage.isImage) {
      console.warn(`[gallery.${hash}.json.ts] Skipping invalid image: ${id}`)
      continue
    }
    const placeholder = await generatePlaceholder(
      remoteImage.data,
      remoteImage.width,
      remoteImage.height,
      PLACEHOLDER_PIXEL_TARGET
    )

    const aspectRatio = remoteImage.width / remoteImage.height
    const thumbnail = await getThumbnail(id, THUMBNAIL_WIDTH, aspectRatio)

    data.push({
      uuid,
      src: id,
      desc,
      thumbnail,
      placeholder,
      aspectRatio,
    })

    mkdirSync(CACHE_PATH, { recursive: true })
    writeFileSync(
      CACHE_PATH + uuid,
      JSON.stringify({ placeholder, aspectRatio })
    )

    continue
  }

  const localImagePath = localImageKeys.find((path) => path.includes(id))
  if (!localImagePath) {
    console.warn(`[gallery.${hash}.json.ts] Skipping invalid image: ${id}`)
    continue
  }

  const localImage = (await localImages[localImagePath]()).default
  const uuid = shorthash(
    id + PLACEHOLDER_PIXEL_TARGET + localImage.width + localImage.height
  )
  try {
    const cache = JSON.parse(readFileSync(CACHE_PATH + uuid, 'utf-8'))
    const thumbnail = await getThumbnail(
      localImage,
      THUMBNAIL_WIDTH,
      cache.aspectRatio
    )
    data.push({
      uuid,
      src: localImage.src,
      desc,
      thumbnail,
      placeholder: cache.placeholder,
      aspectRatio: cache.aspectRatio,
    })
    continue
  } catch (_) {
    // ignore cache miss
  }

  const localImageBuffer = readFileSync(
    (
      localImage as ImageMetadata & {
        fsPath: string
      }
    ).fsPath
  )
  const placeholder = await generatePlaceholder(
    localImageBuffer,
    localImage.width,
    localImage.height,
    PLACEHOLDER_PIXEL_TARGET
  )

  const aspectRatio = localImage.width / localImage.height
  const thumbnail = await getThumbnail(localImage, THUMBNAIL_WIDTH, aspectRatio)

  data.push({
    uuid,
    src: localImage.src,
    desc,
    thumbnail,
    placeholder,
    aspectRatio,
  })

  mkdirSync(CACHE_PATH, { recursive: true })
  writeFileSync(CACHE_PATH + uuid, JSON.stringify({ placeholder, aspectRatio }))
}

export const GET: APIRoute = ({ params }) => {
  return new Response(JSON.stringify([params.hash, data]), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}

export async function getStaticPaths() {
  return [{ params: { hash } }]
}
