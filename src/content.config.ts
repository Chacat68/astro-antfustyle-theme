import { glob, file, type Loader } from 'astro/loaders'
import { defineCollection } from 'astro:content'

import { feedLoader } from '@ascorbic/feed-loader'
import { githubReleasesLoader } from 'astro-loader-github-releases'
import { githubPrsLoader } from 'astro-loader-github-prs'

import {
  postSchema,
  postSchemaEn,
  projectSchema,
  friendSchema,
  streamSchema,
  photoSchema,
  aiGallerySchema,
} from '~/content/schema'

const githubToken = process.env.GITHUB_TOKEN?.trim()

function withSafeRemoteLoader(
  loader: Loader | undefined,
  name: string
): Loader {
  type LoaderArgs = Parameters<Loader['load']>[0]

  return {
    ...(loader ?? {}),
    name,
    load: async (args: LoaderArgs) => {
      if (!loader) return

      try {
        await loader.load(args)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        args.logger.warn(
          `[${name}] ${message}; keeping previously synced data.`
        )
      }
    },
  }
}

const githubReleases = githubToken
  ? githubReleasesLoader({
      mode: 'repoList',
      repos: [
        'withastro/astro',
        'withastro/starlight',
        'lin-stephanie/astro-loaders',
        'lin-stephanie/astro-antfustyle-theme',
      ],
      monthsBack: 2,
      entryReturnType: 'byRelease',
      githubToken,
    })
  : undefined

const githubPrs = githubToken
  ? githubPrsLoader({
      search:
        'repo:withastro/astro repo:withastro/starlight repo:lin-stephanie/astro-antfustyle-theme',
      monthsBack: 1,
      githubToken,
    })
  : undefined

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

const friends = defineCollection({
  loader: file('./src/content/friends/data.json'),
  schema: friendSchema,
})

const releases = defineCollection({
  loader: withSafeRemoteLoader(githubReleases, 'github-releases'),
})

const prs = defineCollection({
  loader: withSafeRemoteLoader(githubPrs, 'github-prs'),
})

const photos = defineCollection({
  loader: file('src/content/photos/data.json'),
  schema: photoSchema,
})

const aiGallery = defineCollection({
  loader: file('src/content/ai-gallery/data.json'),
  schema: aiGallerySchema,
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
  blog,
  blog_en,
  projects,
  friends,
  releases,
  prs,
  photos,
  aiGallery,
  changelog,
  streams,
  feeds,
}
