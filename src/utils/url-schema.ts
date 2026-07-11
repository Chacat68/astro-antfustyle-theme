import { z } from 'zod'

/** 仅允许 http(s) URL，拒绝 javascript: 等危险 scheme */
export const httpUrlSchema = z
  .string()
  .url('Invalid url.')
  .refine(
    (value) => {
      try {
        const { protocol } = new URL(value)
        return protocol === 'https:' || protocol === 'http:'
      } catch {
        return false
      }
    },
    { message: 'URL must use http or https.' }
  )
