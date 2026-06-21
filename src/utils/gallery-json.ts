/**
 * photos / gallery JSON endpoint 的公共构建逻辑。
 *
 * 注意：`import.meta.glob` 只接受字面量，因此 glob 结果由各 endpoint
 * 自行声明后作为 `localImages` 传入。
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import crypto from 'node:crypto'

import { shorthash } from 'astro/runtime/server/shorthash.js'

import {
  fetchRemoteImageWithSharp,
  generatePlaceholder,
  getThumbnail,
} from '~/utils/image'

import type { PhotoGalleryItem } from '~/types/photo-gallery'

const PLACEHOLDER_PIXEL_TARGET = 100
// balance high pixel density and file size
const THUMBNAIL_WIDTH = 720
const VERSION = 1

export interface GalleryEntry {
  id: string
  desc: string
  /** 仅 AI 画廊；相册条目勿填 */
  tags?: string[]
}

export interface BuildGalleryOptions {
  entries: GalleryEntry[]
  /** `import.meta.glob` 的结果（图片懒加载模块映射） */
  localImages: Record<string, () => Promise<{ default: ImageMetadata }>>
  /** placeholder/aspectRatio 的本地缓存目录（如 `./node_modules/.astro/photos/`） */
  cachePath: string
  /** 日志前缀（如 `photos.<hash>.json.ts`） */
  logPrefix: string
}

/** 由条目内容计算 8 位短 hash，用于带缓存破坏参数的文件名 */
export function computeGalleryHash(entries: GalleryEntry[]): string {
  return crypto
    .createHash('sha256')
    .update(`${VERSION}-${JSON.stringify(entries)}`)
    .digest('hex')
    .slice(0, 8)
}

function readCache(cachePath: string, uuid: string) {
  return JSON.parse(readFileSync(cachePath + uuid, 'utf-8')) as {
    placeholder: string
    aspectRatio: number
  }
}

function writeCache(
  cachePath: string,
  uuid: string,
  cache: { placeholder: string; aspectRatio: number }
) {
  mkdirSync(cachePath, { recursive: true })
  writeFileSync(cachePath + uuid, JSON.stringify(cache))
}

export async function buildGalleryData({
  entries,
  localImages,
  cachePath,
  logPrefix,
}: BuildGalleryOptions): Promise<PhotoGalleryItem[]> {
  const data: PhotoGalleryItem[] = []
  const localImageKeys = Object.keys(localImages)

  for (const { id, desc, tags } of entries) {
    // remote image
    if (id.startsWith('http://') || id.startsWith('https://')) {
      const uuid = shorthash(id + PLACEHOLDER_PIXEL_TARGET)

      // try to load from cache first
      try {
        const cache = readCache(cachePath, uuid)
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
          ...(tags?.length ? { tags } : {}),
        })
        continue
      } catch (_) {
        // ignore cache miss
      }

      // get placeholder
      const remoteImage = await fetchRemoteImageWithSharp(id)
      if (!remoteImage.isImage) {
        console.warn(`[${logPrefix}] Skipping invalid image: ${id}`)
        continue
      }
      const placeholder = await generatePlaceholder(
        remoteImage.data,
        remoteImage.width,
        remoteImage.height,
        PLACEHOLDER_PIXEL_TARGET
      )

      // get thumbnail
      const aspectRatio = remoteImage.width / remoteImage.height
      const thumbnail = await getThumbnail(id, THUMBNAIL_WIDTH, aspectRatio)

      data.push({
        uuid,
        src: id,
        desc,
        thumbnail,
        placeholder,
        aspectRatio,
        ...(tags?.length ? { tags } : {}),
      })
      writeCache(cachePath, uuid, { placeholder, aspectRatio })
      continue
    }

    // local image: match id with local image path
    const localImagePath = localImageKeys.find((path) => path.includes(id))
    if (!localImagePath) {
      console.warn(`[${logPrefix}] Skipping invalid image: ${id}`)
      continue
    }

    const localImage = (await localImages[localImagePath]()).default
    const uuid = shorthash(
      id + PLACEHOLDER_PIXEL_TARGET + localImage.width + localImage.height
    )

    // try to load from cache first
    try {
      const cache = readCache(cachePath, uuid)
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
        ...(tags?.length ? { tags } : {}),
      })
      continue
    } catch (_) {
      // ignore cache miss
    }

    // get placeholder
    const localImageBuffer = readFileSync(
      (localImage as ImageMetadata & { fsPath: string }).fsPath
    )
    const placeholder = await generatePlaceholder(
      localImageBuffer,
      localImage.width,
      localImage.height,
      PLACEHOLDER_PIXEL_TARGET
    )

    // get thumbnail
    const aspectRatio = localImage.width / localImage.height
    const thumbnail = await getThumbnail(
      localImage,
      THUMBNAIL_WIDTH,
      aspectRatio
    )

    data.push({
      uuid,
      src: localImage.src,
      desc,
      thumbnail,
      placeholder,
      aspectRatio,
      ...(tags?.length ? { tags } : {}),
    })
    writeCache(cachePath, uuid, { placeholder, aspectRatio })
  }

  return data
}

/** JSON endpoint 的统一响应（一年期 immutable 缓存，配合文件名 hash 失效） */
export function createGalleryResponse(
  hash: string | undefined,
  data: PhotoGalleryItem[]
): Response {
  return new Response(JSON.stringify([hash, data]), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
