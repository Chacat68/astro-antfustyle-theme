import { z } from 'astro/zod'

/** 仅允许 http(s) URL，拒绝 javascript: 等危险 scheme（Zod 4：用 z.url()） */
export const httpUrlSchema = z
  .url({ error: 'Invalid url.' })
  .refine(
    (value) => {
      try {
        const { protocol } = new URL(value)
        return protocol === 'https:' || protocol === 'http:'
      } catch {
        return false
      }
    },
    { error: 'URL must use http or https.' }
  )
