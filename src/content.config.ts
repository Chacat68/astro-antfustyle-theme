import { glob, file } from 'astro/loaders'
import { defineCollection } from 'astro:content'

import { feedLoader } from '@ascorbic/feed-loader'
import { githubReleasesLoader } from 'astro-loader-github-releases'
import { githubPrsLoader } from 'astro-loader-github-prs'
import { blueskyPostsLoader } from 'astro-loader-bluesky-posts'

import {
  pageSchema,
  postSchema,
  postSchemaEn,
  projectSchema,
  streamSchema,
  photoSchema,
} from '~/content/schema'

interface RemoteLoaderContext {
  logger: {
    warn: (message: string) => void
  }
  store?: {
    clear?: () => void
  }
}

interface RemoteLoader<TContext extends RemoteLoaderContext> {
  load: (args: TContext) => Promise<unknown>
  name?: string
  [key: string]: unknown
}

function withSafeRemoteLoader<TContext extends RemoteLoaderContext>(
  loader: RemoteLoader<TContext>,
  name: string
) {
  return {
    ...loader,
    name,
    load: async (args: TContext) => {
      try {
        await loader.load(args)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        args.logger.warn(`[${name}] ${message}`)
        args.store?.clear?.()
      }
    },
  }
}

const pages = defineCollection({
  loader: glob({ base: './src/pages', pattern: '**/*.mdx' }),
  schema: pageSchema,
})

const home = defineCollection({
  loader: glob({ base: './src/content/home', pattern: 'index.mdx' }),
})

const blog = defineCollection({
  loader: glob({ base: './src/content/blog/zh', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

const blog_en = defineCollection({
  loader: glob({ base: './src/content/blog/en', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchemaEn,
})

const projects = defineCollection({
  loader: file('./src/content/projects/data.json'),
  schema: projectSchema,
})

const releases = defineCollection({
  loader: withSafeRemoteLoader(
    githubReleasesLoader({
      mode: 'repoList',
      repos: [
        'withastro/astro',
        'withastro/starlight',
        'lin-stephanie/astro-loaders',
        'lin-stephanie/astro-antfustyle-theme',
      ],
      monthsBack: 2,
      entryReturnType: 'byRelease',
      clearStore: true,
    }),
    'github-releases'
  ),
})

const prs = defineCollection({
  loader: withSafeRemoteLoader(
    githubPrsLoader({
      search:
        'repo:withastro/astro repo:withastro/starlight repo:lin-stephanie/astro-antfustyle-theme',
      monthsBack: 1,
      clearStore: true,
    }),
    'github-prs'
  ),
})

const highlights = defineCollection({
  loader: withSafeRemoteLoader(
    blueskyPostsLoader({
      uris: [
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lifesehhok27',
        'at://did:plc:iwhvwluesbbqtslwwdzgiize/app.bsky.feed.post/3lh3aonbqes2y',
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lfwu3pka2c2j',
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lfsayyhu4c2j',
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lf3iyptedc2e',
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lcv2yftszs2z',
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lcl5ndm52c2s',
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lcdimk36e226',
        'at://did:plc:6kf6jxl44h34mprhykvqljcx/app.bsky.feed.post/3lbkb6hizhk2f',
        'at://did:plc:oky5czdrnfjpqslsw2a5iclo/app.bsky.feed.post/3lbd2eaura22r',
        'at://did:plc:oky5czdrnfjpqslsw2a5iclo/app.bsky.feed.post/3lbayyemhzs2v',
      ],
      newlineHandling: 'paragraph',
      fetchThread: true,
      threadDepth: 4,
      fetchOnlyAuthorReplies: true,
    }),
    'bluesky-posts'
  ),
})

const photos = defineCollection({
  loader: file('src/content/photos/data.json'),
  schema: photoSchema,
})

const changelog = defineCollection({
  loader: glob({
    base: './src/content/changelog',
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: postSchema,
})

const streams = defineCollection({
  loader: file('./src/content/streams/data.json'),
  schema: streamSchema,
})

const feeds = defineCollection({
  loader: withSafeRemoteLoader(
    feedLoader({
      url: 'https://astro.build/rss.xml',
    }),
    'feeds'
  ),
})

export const collections = {
  pages,
  home,
  blog,
  blog_en,
  projects,
  releases,
  prs,
  highlights,
  photos,
  changelog,
  streams,
  feeds,
}
