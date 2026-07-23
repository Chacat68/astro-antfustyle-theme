#!/usr/bin/env node
/**
 * 将博客 frontmatter 的 description 调整到 50–160 字符。
 * - 偏长：优先在句号边界截断；无法断句时在词边界收束并以句号结尾（避免半截 …）
 * - 偏短：用 subtitle / 正文首段补充
 * - 清理「欢迎阅读全文了解更多」等填充句
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT_DIRS = ['src/content/blog', 'src/content/changelog']
const MIN_LEN = 50
const MAX_LEN = 160
const FILLER_PATTERNS = [
  /\s*欢迎阅读全文了解更多[。.!！]?\s*$/u,
  /\s*点击查看全文[。.!！]?\s*$/u,
  /\s*Read more\.?\s*$/i,
]

function walkMarkdown(directory, files = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      walkMarkdown(entryPath, files)
      continue
    }
    if (/\.mdx?$/.test(entry.name)) files.push(entryPath)
  }
  return files
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) return null

  const raw = match[1]
  const body = match[2]
  const fields = {}

  for (const line of raw.split('\n')) {
    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!fieldMatch) continue

    const [, key, value] = fieldMatch
    fields[key] = unquoteYamlScalar(value.trim())
  }

  return { raw, body, fields }
}

function unquoteYamlScalar(value) {
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    return value.slice(1, -1).replace(/''/g, "'")
  }
  return value
}

function quoteYamlScalar(value) {
  if (/[:#{}[\],&*!|>'"%@`]/.test(value) || value.startsWith(' ')) {
    return `'${value.replace(/'/g, "''")}'`
  }
  return value
}

function stripFiller(description) {
  let next = description.trim().replace(/\s+/g, ' ')
  next = next
    .replace(/::[a-zA-Z][\w-]*(\{[^}]*\})?/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  for (const pattern of FILLER_PATTERNS) {
    next = next.replace(pattern, '').trim()
  }
  return next.replace(/[….]{2,}$/u, '').replace(/…$/u, '').trim()
}

function ensureTerminalPunctuation(text, prefersChinese) {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (/[.!?。！？]$/u.test(trimmed)) return trimmed
  return `${trimmed}${prefersChinese ? '。' : '.'}`
}

function truncateAtSentence(description, maxLength = MAX_LEN) {
  const normalized = description.trim().replace(/\s+/g, ' ')
  if (normalized.length <= maxLength) return normalized

  const sentencePattern = /[^.!?。！？]+[.!?。！？]+/gu
  const sentences = normalized.match(sentencePattern) || []
  let assembled = ''
  for (const sentence of sentences) {
    const candidate = `${assembled}${sentence}`.trim()
    if (candidate.length <= maxLength) assembled = candidate
    else break
  }
  if (assembled.length >= MIN_LEN) return assembled

  const prefersChinese = /[\u4e00-\u9fff]/u.test(normalized)
  const budget = maxLength - 1
  const truncated = normalized.slice(0, budget)
  const separators = prefersChinese
    ? ['。', '！', '？', '；', '，', ' ']
    : ['. ', '! ', '? ', '; ', ', ', ' ']

  for (const separator of separators) {
    const index = truncated.lastIndexOf(separator)
    if (index > maxLength * 0.55) {
      const cut = truncated.slice(0, index + (separator.trim() ? separator.length : 0)).trim()
      return ensureTerminalPunctuation(cut.replace(/[,:;，；、]+$/u, ''), prefersChinese)
    }
  }

  return ensureTerminalPunctuation(truncated.trim(), prefersChinese)
}

function stripMarkdownInline(text) {
  return text
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/[_~>#-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFirstParagraph(body) {
  const lines = body.split('\n')
  const paragraphs = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (paragraphs.length > 0) break
      continue
    }
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('```') ||
      trimmed.startsWith('import ') ||
      trimmed.startsWith('<') ||
      trimmed.startsWith('![') ||
      trimmed.startsWith(':::') ||
      trimmed.startsWith('---') ||
      trimmed.startsWith('>')
    ) {
      continue
    }

    paragraphs.push(trimmed)
    if (paragraphs.join(' ').length >= MIN_LEN) break
  }

  const text = stripMarkdownInline(paragraphs.join(' '))
  return text.length >= 20 ? text : null
}

function prefersChineseText(fields, body) {
  const sample = `${fields.title || ''} ${fields.description || ''} ${body.slice(0, 200)}`
  return /[\u4e00-\u9fff]/u.test(sample)
}

function buildShortDescription(fields, body) {
  const title = fields.title || ''
  const subtitle = fields.subtitle || ''
  const current = stripFiller(fields.description || '')
  const firstParagraph = extractFirstParagraph(body)
  const chinese = prefersChineseText(fields, body)

  const candidates = [
    subtitle,
    firstParagraph,
    current && firstParagraph ? `${current} ${firstParagraph}` : '',
    title && current ? (chinese ? `${title}：${current}` : `${title}: ${current}`) : '',
    current,
    title
      ? chinese
        ? `关于「${title}」的记录、思考与实践分享。`
        : `Notes, reflections, and practical takeaways about ${title}.`
      : '',
  ].filter(Boolean)

  for (const candidate of candidates) {
    const normalized = stripFiller(candidate)
    if (normalized.length >= MIN_LEN) {
      return truncateAtSentence(normalized)
    }
  }

  const fallback = chinese
    ? `${title || '随笔'}：记录一次值得回味的阅读、创作或生活片段。`
    : `${title || 'Notes'}: a short record of reading, creating, or everyday practice.`
  return truncateAtSentence(fallback)
}

function replaceDescription(raw, nextDescription) {
  const quoted = quoteYamlScalar(nextDescription)
  if (/^description:\s*.+$/m.test(raw)) {
    return raw.replace(/^description:\s*.+$/m, `description: ${quoted}`)
  }
  return `${raw}\ndescription: ${quoted}`
}

function normalizeDescription(fields, body) {
  const cleaned = stripFiller(fields.description || '')
  if (!cleaned) return buildShortDescription(fields, body)

  const chinese = prefersChineseText(fields, body)
  const hasTerminal = /[.!?。！？]$/u.test(cleaned)
  const looksTruncated = !hasTerminal || /[,:;，；、]$/u.test(cleaned)

  if (cleaned.length > MAX_LEN || looksTruncated) {
    const firstParagraph = extractFirstParagraph(body)
    const source =
      looksTruncated && firstParagraph
        ? `${cleaned.replace(/[,:;，；、]+$/u, '')}. ${firstParagraph}`
        : cleaned
    const next = truncateAtSentence(source)
    if (next.length >= MIN_LEN) return next
  }

  if (cleaned.length < MIN_LEN) {
    return buildShortDescription({ ...fields, description: cleaned }, body)
  }

  return ensureTerminalPunctuation(cleaned, chinese)
}

function dedupeDescriptions(updates) {
  const byDescription = new Map()

  for (const item of updates) {
    if (!byDescription.has(item.next)) byDescription.set(item.next, [])
    byDescription.get(item.next).push(item)
  }

  for (const [, items] of byDescription) {
    if (items.length <= 1) continue

    for (const item of items) {
      const chinese = prefersChineseText(item.fields, item.parsed.body)
      const suffix = item.fields.title
        ? chinese
          ? ` 本文围绕「${item.fields.title}」展开。`
          : ` This piece focuses on ${item.fields.title}.`
        : chinese
          ? ' 记录一次具体的实践与思考。'
          : ' A concrete note on practice and reflection.'
      item.next = truncateAtSentence(`${item.next}${suffix}`)
    }
  }
}

function main() {
  const files = CONTENT_DIRS.flatMap((directory) => walkMarkdown(directory))
  const updates = []

  for (const file of files) {
    const text = readFileSync(file, 'utf8')
    const parsed = parseFrontmatter(text)
    if (!parsed) continue

    const next = normalizeDescription(parsed.fields, parsed.body)
    const current = (parsed.fields.description || '').trim()
    if (next === current) continue

    updates.push({
      file,
      fields: parsed.fields,
      current,
      next,
      parsed,
    })
  }

  dedupeDescriptions(updates)

  for (const item of updates) {
    const nextRaw = replaceDescription(item.parsed.raw, item.next)
    const nextText = `---\n${nextRaw}\n---\n${item.parsed.body}`
    writeFileSync(item.file, nextText, 'utf8')
  }

  console.log(`已更新 ${updates.length} 篇文章的 description。`)

  const short = updates.filter((item) => item.current.length < MIN_LEN).length
  const long = updates.filter((item) => item.current.length > MAX_LEN).length
  const filler = updates.filter((item) =>
    /欢迎阅读全文了解更多|点击查看全文/u.test(item.current)
  ).length
  const truncated = updates.filter((item) => /…|\.\.\.$/u.test(item.current)).length
  console.log(`  其中偏短修复：${short}`)
  console.log(`  其中偏长修复：${long}`)
  console.log(`  其中填充句清理：${filler}`)
  console.log(`  其中截断省略号修复：${truncated}`)
}

main()
