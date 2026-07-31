/**
 * 在 `import.meta.glob` 结果中解析本地图片路径。
 * 禁止 `path.includes(id)` 子串匹配，避免短 id 误命中更长文件名。
 *
 * 接受：完整 glob 键、以 `/id` 结尾的相对片段、或唯一 basename。
 * 多个候选时返回 undefined 并 warn，避免静默错图。
 */
export function resolveLocalImagePath(
  id: string,
  localImageKeys: string[],
  warn: (message: string) => void = console.warn
): string | undefined {
  if (!id || id.startsWith('http://') || id.startsWith('https://')) {
    return undefined
  }

  const normalizedId = id.replace(/^\/+/, '')
  const suffixMatches = localImageKeys.filter(
    (path) =>
      path === id ||
      path === `/${normalizedId}` ||
      path.endsWith(`/${normalizedId}`)
  )

  if (suffixMatches.length === 1) return suffixMatches[0]
  if (suffixMatches.length > 1) {
    warn(
      `[gallery-json] Ambiguous local image id "${id}" matched: ${suffixMatches.join(', ')}`
    )
    return undefined
  }

  const idBase = normalizedId.split('/').pop()!
  // 仅当 id 本身不是「带路径的相对片段」时，才回退到 basename
  // （例如 id=category/a.webp 已在上方按后缀处理）
  if (normalizedId.includes('/')) return undefined

  const byBasename = localImageKeys.filter((path) => {
    const base = path.split('/').pop()
    return base === idBase
  })

  if (byBasename.length === 1) return byBasename[0]
  if (byBasename.length > 1) {
    warn(
      `[gallery-json] Ambiguous local image id "${id}" matched: ${byBasename.join(', ')}`
    )
  }

  return undefined
}
