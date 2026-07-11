import GithubSlugger from 'github-slugger'

export interface MarkdownHeading {
  depth: number
  text: string
  slug: string
}

/**
 * 从 Markdown `body` 提取标题，slug 与 Astro/rehype-slug（github-slugger）对齐。
 * 跳过 fenced code block，避免把代码里的 `#` 当成标题。
 * 用于 Shorts 等场景，避免对每篇 `await render()`。
 */
export function extractMarkdownHeadings(
  body: string | undefined,
  depthFilter?: number
): MarkdownHeading[] {
  if (!body) return []

  const slugger = new GithubSlugger()
  const headings: MarkdownHeading[] = []
  let inFence = false

  for (const line of body.split(/\r?\n/)) {
    if (/^`{3,}/.test(line.trim())) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue

    const depth = match[1].length
    const text = match[2]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`~]/g, '')
      .trim()
    if (!text) continue

    // 所有标题都要 slug，保证重复标题的 `-1`/`-2` 后缀与正文锚点一致
    const slug = slugger.slug(text)
    if (depthFilter !== undefined && depth !== depthFilter) continue
    headings.push({ depth, text, slug })
  }

  return headings
}
