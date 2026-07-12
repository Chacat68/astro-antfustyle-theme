import { z } from 'astro/zod'

import { httpUrlSchema } from '~/utils/url-schema'

export { httpUrlSchema }

/* Pages*/
export const pageSchema = z.object({
  title: z
    .string()
    .default('')
    .describe(
      'Sets the page title, formatted with `SITE.title` as `<pageTitle> - <siteTitle>` for metadata and automatic OG image generation. If undefined or empty, only `<siteTitle>` is displayed, and OG image generation is skipped.'
    ),
  subtitle: z
    .string()
    .default('')
    .describe(
      'Provides a page subtitle. If provided, it will be displayed below the title. If not needed, leave the field as an empty string or delete it.'
    ),
  description: z
    .string()
    .default('')
    .describe(
      'Provides a brief description, used in meta tags for SEO and sharing purposes. If not needed, leave the field as an empty string or delete it, and the `SITE.description` will be used directly.'
    ),
  bgType: z
    .union([
      z.literal(false),
      z.enum(['plum', 'dot', 'rose', 'particle', 'wave', 'constellation']),
    ])
    .default(false)
    .describe(
      'Specifies whether to apply a background on this page and select its type. If not needed, delete the field or set to `false`.'
    ),
  toc: z
    .boolean()
    .default(false)
    .describe(
      'Controls whether the table of contents (TOC) is generated for the page.'
    ),
  ogImage: z
    .union([z.string(), z.boolean()])
    .default(true)
    .describe(
      'Specifies the Open Graph (OG) image for social media sharing. To auto-generate OG image, delete the field or set to `true`. To disable it, set the field to `false`. To use a custom image, provide the full filename from `/public/og-images/`.'
    ),
  noindex: z
    .boolean()
    .default(false)
    .describe(
      'Prevents low-value or duplicate utility pages from being indexed while still allowing crawlers to follow links.'
    ),
})

export type PageSchema = z.infer<typeof pageSchema>

function createDateOnlySchema(fieldName: string) {
  return z.iso
    .date({ error: `${fieldName} must be YYYY-MM-DD.` })
    .transform((value) => new Date(value))
}

/* Posts */
function createPostSchema(options?: { titleMax?: number }) {
  const titleMax = options?.titleMax ?? 60

  return z
    .object({
      title: z
        .string()
        .max(titleMax)
        .describe(
          "**Required**. Sets the post title, limited to **60 characters** by default. This follows Moz's recommendation, ensuring approximately 90% of titles display correctly in SERPs and preventing truncation on smaller screens or social platforms. [Learn more](https://moz.com/learn/seo/title-tag)."
        ),
      subtitle: z
        .string()
        .default('')
        .describe(
          'Provides a post subtitle. If provided, it will be displayed below the title. If not needed, leave the field as an empty string or delete it.'
        ),
      description: z
        .string()
        .default('')
        .describe(
          'Provides a brief description, used in meta tags for SEO and sharing purposes. If not needed, leave the field as an empty string or delete it, and the `SITE.description` will be used directly.'
        ),
      image: z
        .string()
        .default('')
        .describe(
          'Specifies the cover image URL for the post. If not needed, leave the field as an empty string or delete it.'
        ),
      tags: z
        .array(z.string())
        .default([])
        .describe(
          'Specifies tags for categorizing the post. If not needed, leave as an empty array or delete it.'
        ),
      category: z
        .string()
        .default('')
        .describe(
          'Specifies the category of the post. If not needed, leave the field as an empty string or delete it.'
        ),
      lang: z
        .string()
        .optional()
        .describe(
          'Specifies the language of the post (e.g., "zh-CN", "en"). If not specified, the default site language is used.'
        ),
      pubDate: createDateOnlySchema('pubDate')
        .optional()
        .describe(
          '**Required**. Specifies the publication date in `YYYY-MM-DD` format.'
        ),
      published: createDateOnlySchema('published')
        .optional()
        .describe(
          'Deprecated. Use `pubDate` instead. Specifies the publication date.'
        ),
      lastModDate: z
        .union([createDateOnlySchema('lastModDate'), z.literal('')])
        .optional()
        .describe(
          'Tracks the last modified date in `YYYY-MM-DD` format. If not needed, leave the field as an empty string or delete it.'
        ),
      updated: createDateOnlySchema('updated')
        .optional()
        .describe(
          'Deprecated. Use `lastModDate` instead. Tracks the last modified date.'
        ),
      minutesRead: z
        .number()
        .optional()
        .describe(
          'Provides an estimated reading time in minutes. To auto-generate, delete the field; to hide it on the page, enter 0'
        ),
      radio: z
        .boolean()
        .default(false)
        .describe(
          'Indicates if the post includes audio content or links to an external audio source. If `true`, an icon will be added to the post item in the list.'
        ),
      video: z
        .boolean()
        .default(false)
        .describe(
          'Indicates if the post includes video content or links to an external video source. If `true`, an icon will be added to the post item in the list.'
        ),
      platform: z
        .string()
        .default('')
        .describe(
          'Specifies the platform where the audio or video content is published. If provided, the platform name will be displayed. If not needed, leave the field as an empty string or delete it.'
        ),
      ogImage: z
        .union([z.string(), z.boolean()])
        .default(true)
        .describe(
          'Specifies the Open Graph (OG) image for social media sharing. To auto-generate OG image, delete the field or set to `true`. To disable it, set the field to `false`. To use a custom image, provide the full filename from `/public/og-images/`.'
        ),
      toc: z
        .boolean()
        .default(true)
        .describe(
          'Controls whether the table of contents (TOC) is generated for the post.'
        ),
      share: z
        .boolean()
        .default(true)
        .describe('Controls whether social sharing is available for the post.'),
      giscus: z
        .boolean()
        .default(true)
        .describe(
          'Controls whether Giscus comments are available for the post.'
        ),
      search: z
        .boolean()
        .default(true)
        .describe(
          'Controls whether the post is included in Pagefind search indexing.'
        ),
      redirect: httpUrlSchema
        .optional()
        .describe('Defines a URL to redirect the post.'),
      draft: z
        .boolean()
        .default(false)
        .describe(
          'Marks the post as a draft. If `true`, it is only visible in development and excluded from production builds.'
        ),
    })
    .superRefine((data, ctx) => {
      // Handle pubDate/published field mapping
      if (!data.pubDate && data.published) {
        data.pubDate = data.published
      }
      if (!data.pubDate) {
        ctx.addIssue({
          code: 'custom',
          path: ['pubDate'],
          message: 'Either pubDate or published field is required',
        })
      }

      // Handle lastModDate/updated field mapping
      if (!data.lastModDate && data.updated) {
        data.lastModDate = data.updated
      }

      // Clean up deprecated fields
      const dataObj = data as Record<string, unknown>
      delete dataObj.published
      delete dataObj.updated
    })
}

export const postSchema = createPostSchema({ titleMax: 60 })

// English translations tend to be longer than Chinese titles.
export const postSchemaEn = createPostSchema({ titleMax: 120 })

export type PostSchema = z.infer<typeof postSchema>
export type PostSchemaEn = z.infer<typeof postSchemaEn>

/* Projects */
export const projectSchema = z.object({
  id: z.string().describe('**Required**. Name of the project to be displayed.'),
  link: httpUrlSchema.describe(
    '**Required**. URL linking to the project page or repository.'
  ),
  desc: z
    .string()
    .describe('**Required**. A brief description summarizing the project.'),
  descEn: z
    .string()
    .optional()
    .describe(
      'Optional. English description shown on `/en/*` routes; falls back to `desc`.'
    ),
  icon: z
    .string()
    .regex(
      /^i-[\w-]+(:[\w-]+)?$/,
      'Icon must be in the format `i-<collection>-<icon>` or `i-<collection>:<icon>` as per [UnoCSS](https://unocss.dev/presets/icons) specs.'
    )
    .describe(
      '**Required**. Icon representing the project. It must be in the format `i-<collection>-<icon>` or `i-<collection>:<icon>` as per [UnoCSS](https://unocss.dev/presets/icons) specs. [Check all available icons here](https://icones.js.org/).'
    ),
  category: z.string().describe('**Required**. Category of the project.'),
  categoryEn: z
    .string()
    .optional()
    .describe(
      'Optional. English category shown on `/en/*` routes; falls back to `category`.'
    ),
})

export type ProjectSchema = z.infer<typeof projectSchema>

/* Friends */
export const friendSchema = z.object({
  id: z
    .string()
    .describe('**Required**. Name of the friend/blog to be displayed.'),
  link: httpUrlSchema.describe(
    '**Required**. URL linking to the friend blog or website.'
  ),
  desc: z
    .string()
    .describe(
      '**Required**. A brief description about the friend or their blog.'
    ),
  descEn: z
    .string()
    .optional()
    .describe(
      'Optional. English description shown on `/en/*` routes; falls back to `desc`.'
    ),
  avatar: httpUrlSchema
    .optional()
    .describe(
      'URL of the friend avatar image. If provided, it will be displayed instead of the icon.'
    ),
  icon: z
    .string()
    .regex(
      /^i-[\w-]+(:[\w-]+)?$/,
      'Icon must be in the format `i-<collection>-<icon>` or `i-<collection>:<icon>` as per [UnoCSS](https://unocss.dev/presets/icons) specs.'
    )
    .optional()
    .describe(
      'Icon representing the friend. Used as fallback when avatar is not provided. It must be in the format `i-<collection>-<icon>` or `i-<collection>:<icon>` as per [UnoCSS](https://unocss.dev/presets/icons) specs. [Check all available icons here](https://icones.js.org/).'
    ),
  category: z.string().describe('**Required**. Category of the friend link.'),
  categoryEn: z
    .string()
    .optional()
    .describe(
      'Optional. English category shown on `/en/*` routes; falls back to `category`.'
    ),
})

export type FriendSchema = z.infer<typeof friendSchema>

/* Photos */
export const photoSchema = z.object({
  id: z
    .string()
    .describe(
      '**Required**. File (name/path) of the image in the `src/content/photos/` directory or a remote image URL.'
    ),
  desc: z.string().default('').describe('Optional description for the image.'),
})

export type PhotoSchema = z.infer<typeof photoSchema>

/** AI 作品集 / 画廊：与相册相同基础字段，另可选 `tags` 供页面筛选 */
export const aiGallerySchema = z.object({
  id: z
    .string()
    .describe(
      '**Required**. File (name/path) of the image in the `src/content/ai-gallery/` directory or a remote image URL.'
    ),
  desc: z
    .string()
    .default('')
    .describe('Optional caption (e.g. prompt, model, or creation date).'),
  tags: z
    .array(z.string().trim().min(1))
    .default([])
    .transform((tags) => [...new Set(tags)])
    .describe(
      'Optional tags for `/gallery` filters. An entry can belong to multiple tags; omit to show only under “All”.'
    ),
})

export type AiGallerySchema = z.infer<typeof aiGallerySchema>

/* Stremas */
export const streamSchema = z.object({
  id: z.string().describe('**Required**. Sets the stream title.'),
  pubDate: z.coerce
    .date()
    .describe(
      '**Required**. Specifies the publication date. See supported formats [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#examples).'
    ),
  link: httpUrlSchema.describe(
    '**Required**. Specifies the URL link to the stream.'
  ),
  radio: z
    .boolean()
    .default(false)
    .describe(
      'Indicates whether the stream is a radio broadcast. If `true`, an icon will be added to the stream item in the list.'
    ),
  video: z
    .boolean()
    .default(false)
    .describe(
      'Indicates whether the stream is a video broadcast. If `true`, an icon will be added to the stream item in the list.'
    ),
  platform: z
    .string()
    .default('')
    .describe('Specifies the platform where the stream is published.'),
})

export type StreamSchema = z.infer<typeof streamSchema>
