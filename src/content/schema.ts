import { z } from 'astro:content'

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
    .union([z.literal(false), z.enum(['plum', 'dot', 'rose', 'particle'])])
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
})

export type PageSchema = z.infer<typeof pageSchema>

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
      pubDate: z.coerce
        .date()
        .optional()
        .describe(
          '**Required**. Specifies the publication date. See supported formats [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#examples).'
        ),
      published: z.coerce
        .date()
        .optional()
        .describe(
          'Deprecated. Use `pubDate` instead. Specifies the publication date.'
        ),
      lastModDate: z
        .union([z.coerce.date(), z.literal('')])
        .optional()
        .describe(
          'Tracks the last modified date. If not needed, leave the field as an empty string or delete it.'
        ),
      updated: z.coerce
        .date()
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
          'Defines a URL to redirect the post. If not needed, delete the field or set to `false`'
        ),
      redirect: z
        .string()
        .url('Invalid url.')
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
          code: z.ZodIssueCode.custom,
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
  link: z
    .string()
    .url('Invalid url.')
    .describe('**Required**. URL linking to the project page or repository.'),
  desc: z
    .string()
    .describe('**Required**. A brief description summarizing the project.'),
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
})

export type ProjectSchema = z.infer<typeof projectSchema>

/* Friends */
export const friendSchema = z.object({
  id: z
    .string()
    .describe('**Required**. Name of the friend/blog to be displayed.'),
  link: z
    .string()
    .url('Invalid url.')
    .describe('**Required**. URL linking to the friend blog or website.'),
  desc: z
    .string()
    .describe(
      '**Required**. A brief description about the friend or their blog.'
    ),
  avatar: z
    .string()
    .url('Invalid url.')
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

/* Stremas */
export const streamSchema = z.object({
  id: z.string().describe('**Required**. Sets the stream title.'),
  pubDate: z.coerce
    .date()
    .describe(
      '**Required**. Specifies the publication date. See supported formats [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse#examples).'
    ),
  link: z
    .string()
    .url('Invalid url.')
    .describe('**Required**. Specifies the URL link to the stream.'),
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
