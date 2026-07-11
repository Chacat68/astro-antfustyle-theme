import getReadingTime from 'reading-time'

/**
 * 由纯文本估算阅读分钟数。
 * 与 `plugins/remark-reading-time.ts` 使用同一公式，保证列表页与正文页一致。
 */
export function estimateMinutesReadFromText(text: string): number {
  const readingTime = getReadingTime(text)
  return Math.max(1, Math.round(readingTime.minutes))
}

/**
 * 解析展示用阅读时间：
 * - 显式 `0`：隐藏（与 schema / PostMeta 约定一致）
 * - 显式正数：直接使用
 * - 未设置：用正文 `body` 估算（避免列表页对每篇 `render()`）
 */
export function resolveMinutesRead(
  explicit: number | undefined,
  body: string | undefined
): number | undefined {
  if (explicit === 0) return 0
  if (typeof explicit === 'number') return explicit
  if (!body) return undefined
  return estimateMinutesReadFromText(body)
}
