import { getCollection } from 'astro:content'
import {
  AppBskyEmbedImages,
  AppBskyEmbedVideo,
  AppBskyEmbedExternal,
  AppBskyEmbedRecord,
  AppBskyEmbedRecordWithMedia,
} from '@atproto/api'
import { atUriToPostUri } from 'astro-loader-bluesky-posts'

import { resolvePath } from './path'
import { extractMarkdownHeadings } from './markdown-headings'
import { getLocale } from '~/i18n/translate'
import { isDefaultLocale } from '~/i18n/locales'

import type { CollectionEntry, CollectionKey } from 'astro:content'
import type { CardItemData } from '~/components/views/CardItem.astro'
import type { GitHubView } from '~/types'

type CollectionEntryList<K extends CollectionKey = CollectionKey> =
  CollectionEntry<K>[]

/**
 * Ensures that a value is a positive integer.
 */
function ensurePositiveInteger(value: number, name: string) {
  if (Number.isInteger(value) && value > 0) return value
  throw new Error(
    `'${name}' must be a positive integer. Please check 'src/config.ts' for the correct configuration.`
  )
}

/**
 * Parses a tuple of boolean and number.
 */
export function parseTuple(
  tuple: boolean | [boolean, number] | undefined,
  name: string
) {
  if (!tuple || !Array.isArray(tuple) || !tuple[0]) return undefined
  return ensurePositiveInteger(tuple[1], name)
}

/**
 * Retrieves filtered posts from the specified content collection.
 * In production, it filters out draft posts.
 */
export async function getFilteredPosts<
  K extends 'blog' | 'blog_en' | 'changelog',
>(collection: K) {
  return await getCollection(collection, ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  })
}

/**
 * Retrieves blog posts for the current locale.
 * - zh: uses `blog`
 * - en: uses `blog_en` when translations exist, otherwise falls back to `blog`
 */
export async function getLocalizedBlogPosts(locale: unknown) {
  const zhPosts = await getFilteredPosts('blog')

  if (isDefaultLocale(getLocale(locale))) return zhPosts

  let enPosts: CollectionEntry<'blog_en'>[] = []
  try {
    enPosts = await getFilteredPosts('blog_en')
  } catch {
    // The `blog_en` collection may not be generated if it's empty.
    return zhPosts
  }

  return enPosts.length > 0 ? enPosts : zhPosts
}

/**
 * Sorts an array of posts by their publication date in descending order.
 */
export function getSortedPosts(
  posts: CollectionEntryList<'blog' | 'blog_en' | 'changelog'>
) {
  return posts.sort((a, b) => {
    const bd = b.data.pubDate?.valueOf() ?? 0
    const ad = a.data.pubDate?.valueOf() ?? 0
    return bd - ad
  })
}

/**
 * Matches the input string against the rules in `UI.githubView.mainLogoOverrides`
 * or `UI.githubView.subLogoMatches`, and returns the matching URL/Icon.
 */
export function matchLogo(
  input: string,
  logos: GitHubView['mainLogoOverrides'] | GitHubView['subLogoMatches']
) {
  for (const [pattern, logo] of logos) {
    if (typeof pattern === 'string') {
      if (input === pattern) {
        return logo
      }
    } else if (pattern instanceof RegExp) {
      if (pattern.test(input)) {
        return logo
      }
    }
  }
  return undefined
}

/**
 * Extracts the package name (before the `@` version part) from a `tagName`.
 */
export function extractPackageName(tagName: string) {
  const match = tagName.match(/(^@?[^@]+?)(?:@)/)
  if (match) return match[1]
  return tagName
}

/**
 * Extracts the version number from a `tagName`.
 */
export function extractVersionNum(tagName: string) {
  const match = tagName.match(/.+(\d+\.\d+\.\d+(?:-[\w.]+)?)(?:\s|$)/)
  if (match) return match[1]
  return tagName
}

/**
 * Processes the version number and return the highlighted and non-highlighted parts.
 */
export function processVersion(
  versionNum: string
): ['major' | 'minor' | 'patch' | 'pre', string, string] {
  const parts = versionNum.split(/(\.)/g)
  let highlightedIndex = -1
  let versionType: 'major' | 'minor' | 'patch' | 'pre'

  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] !== '.') {
      const num = +parts[i]
      if (!Number.isNaN(num) && num > 0) {
        highlightedIndex = i
        break
      }
    }
  }

  if (highlightedIndex === 0) {
    versionType = 'major'
  } else if (highlightedIndex === 2) {
    versionType = 'minor'
  } else if (highlightedIndex === 4) {
    versionType = 'patch'
  } else {
    versionType = 'pre'
  }

  const nonHighlightedPart = parts.slice(0, highlightedIndex).join('')
  const highlightedPart = parts.slice(highlightedIndex).join('')

  return [versionType, nonHighlightedPart, highlightedPart]
}

/**
 * Processes Bluesky posts and converts them into `CardItemData` interface.
 */
export function processBlueskyPosts(data: CollectionEntryList<'highlights'>) {
  const cards: CardItemData[] = []

  for (const item of data) {
    const { post, replies } = item.data
    const { indexedAt, html, link, embed, author } = post

    const card: CardItemData = {
      date: indexedAt,
      html: html,
      link: link,
    }

    if (embed) {
      if (AppBskyEmbedImages.isView(embed))
        card.images = embed.images.map((img: { thumb: string; alt?: string }) => ({
          src: img.thumb,
          alt: img.alt ?? '',
        }))

      if (AppBskyEmbedVideo.isView(embed))
        card.video = {
          src: `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${author.did}&cid=${embed.cid}`,
          alt: embed.alt ?? '',
          poster: embed.thumbnail ?? '',
        }

      if (AppBskyEmbedExternal.isView(embed))
        card.external = {
          uri: embed.external.uri,
          title: embed.external.title ?? '',
          description: embed.external.description ?? '',
          img: embed.external.thumb ?? '',
        }

      if (AppBskyEmbedRecord.isView(embed)) {
        const { uri, value, author } = embed.record

        card.quote = {
          uri: atUriToPostUri(uri),
          text: value.text as string,
          author: {
            link: `https://bsky.app/profile/${author.handle}`,
            avatar: author.avatar ?? '',
            name: author.displayName ?? '',
            handle: author.handle,
          },
        }
      }

      if (AppBskyEmbedRecordWithMedia.isView(embed)) {
        const { record, media } = embed

        if (media) {
          if (AppBskyEmbedImages.isView(media))
            card.images = media.images.map(
              (img: { thumb?: string; alt?: string }) => ({
                src: img.thumb ?? '',
                alt: img.alt ?? '',
              })
            )

          if (AppBskyEmbedVideo.isView(media))
            card.video = {
              src: `https://bsky.social/xrpc/com.atproto.sync.getBlob?did=${author.did}&cid=${media.cid}`,
              alt: media.alt ?? '',
              poster: media.thumbnail ?? '',
            }

          if (AppBskyEmbedExternal.isView(media))
            card.external = {
              uri: media.external.uri,
              title: media.external.title ?? '',
              description: media.external.description ?? '',
              img: media.external.thumb ?? '',
            }
        }

        if (AppBskyEmbedRecord.isViewRecord(record.record)) {
          const { uri, value, author } = record.record

          card.quote = {
            uri: atUriToPostUri(uri),
            text: value.text as string,
            author: {
              link: `https://bsky.app/profile/${author.handle}`,
              avatar: author.avatar ?? '',
              name: author.displayName ?? '',
              handle: author.handle,
            },
          }
        }
      }
    }

    if (replies && replies.length > 0) {
      card.details = replies.map((reply: { html: string }) => reply.html)
    }

    cards.push(card)
  }

  return cards
}

/**
 * Processes blog posts and converts them into `CardItemData` interface.
 * 从 Markdown body 提取 h2，避免对每篇 `await render()`。
 */
export function getShortsFromBlog(data: CollectionEntryList<'blog'>) {
  const cards: CardItemData[] = []
  const basePath = resolvePath('/blog')
  const sortedData = data.sort((a, b) => {
    const bd = b.data.pubDate?.valueOf() ?? 0
    const ad = a.data.pubDate?.valueOf() ?? 0
    return bd - ad
  })

  for (const item of sortedData) {
    const slug = item.id
    const title = item.data.title
    const date = item.data.pubDate

    const itemCards = extractMarkdownHeadings(item.body, 2).map((h) => ({
      link: `${basePath}${slug}/#${h.slug}`,
      text: `${title}: ${h.text}`,
      date: date,
    }))

    cards.push(...itemCards)
  }

  return cards
}
