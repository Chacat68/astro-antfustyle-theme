/**
 * 为 Pagefind 生成中文召回增强词。
 * 索引器与浏览器 Intl.Segmenter 切词可能不一致（如「马斯克」），
 * 同时写入整词、单字、二元/三元组，提高中文查询命中率。
 */
const CJK_RUN = /[\u4e00-\u9fff]+/gu

export function buildCjkSearchBoost(
  ...parts: (string | string[] | undefined | null)[]
): string {
  const text = parts
    .flatMap((part) => {
      if (!part) return []
      return Array.isArray(part) ? part : [part]
    })
    .join(' ')

  const tokens = new Set<string>()

  for (const run of text.match(CJK_RUN) ?? []) {
    tokens.add(run)
    for (const ch of run) tokens.add(ch)
    for (let i = 0; i < run.length - 1; i++) tokens.add(run.slice(i, i + 2))
    for (let i = 0; i < run.length - 2; i++) tokens.add(run.slice(i, i + 3))
  }

  return [...tokens].join(' ')
}

/** 生成中文查询变体（整词 + 二元/三元组），供多路搜索后合并 */
export function buildCjkQueryVariants(query: string): string[] {
  const variants = new Set<string>([query])
  for (const run of query.match(CJK_RUN) ?? []) {
    if (run.length < 2) continue
    variants.add(run)
    for (let i = 0; i < run.length - 1; i++) variants.add(run.slice(i, i + 2))
    if (run.length >= 3) {
      for (let i = 0; i < run.length - 2; i++) variants.add(run.slice(i, i + 3))
    }
  }
  return [...variants]
}
