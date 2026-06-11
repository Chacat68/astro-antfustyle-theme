#!/usr/bin/env node
/**
 * 将博客 frontmatter 的 description 调整到 50–160 字符。
 * 偏长：智能截断；偏短：优先用 subtitle 或正文首段补充。
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const CONTENT_DIRS = ['src/content/blog', 'src/content/changelog']
const MIN_LEN = 50
const MAX_LEN = 160

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
    return value.slice(1, -1)
  }
  return value
}

function quoteYamlScalar(value) {
  if (/[:#{}[\],&*!|>'"%@`]/.test(value) || value.startsWith(' ')) {
    return `'${value.replace(/'/g, "''")}'`
  }
  return value
}

function truncateDescription(description, maxLength = MAX_LEN) {
  const normalized = description.trim().replace(/\s+/g, ' ')
  if (normalized.length <= maxLength) return normalized

  const truncated = normalized.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > maxLength * 0.6) {
    return `${truncated.slice(0, lastSpace).trimEnd()}…`
  }
  return `${truncated.trimEnd()}…`
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
      trimmed.startsWith('---')
    ) {
      continue
    }

    paragraphs.push(trimmed)
    if (paragraphs.join(' ').length >= MIN_LEN) break
  }

  const text = stripMarkdownInline(paragraphs.join(' '))
  return text.length >= 20 ? text : null
}

function buildShortDescription(fields, body) {
  const title = fields.title || ''
  const subtitle = fields.subtitle || ''
  const current = fields.description || ''

  const candidates = [
    subtitle,
    extractFirstParagraph(body),
    title && current ? `${title}：${current}` : '',
    title ? `关于「${title}」的记录与分享。` : '',
    current,
  ].filter(Boolean)

  for (const candidate of candidates) {
    const normalized = candidate.trim().replace(/\s+/g, ' ')
    if (normalized.length >= MIN_LEN) {
      return truncateDescription(normalized)
    }
  }

  const padded = `${current}${current.endsWith('。') ? '' : '。'} 欢迎阅读全文了解更多。`
  return truncateDescription(padded.length >= MIN_LEN ? padded : `${title}：${padded}`)
}

function replaceDescription(raw, nextDescription) {
  const quoted = quoteYamlScalar(nextDescription)
  if (/^description:\s*.+$/m.test(raw)) {
    return raw.replace(/^description:\s*.+$/m, `description: ${quoted}`)
  }
  return `${raw}\ndescription: ${quoted}`
}

function normalizeDescription(fields, body) {
  const current = (fields.description || '').trim()
  if (!current) return buildShortDescription(fields, body)

  if (current.length > MAX_LEN) {
    return truncateDescription(current)
  }

  if (current.length < MIN_LEN) {
    return buildShortDescription({ ...fields, description: current }, body)
  }

  return current
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
      const suffix = item.fields.title
        ? ` 本文围绕「${item.fields.title}」展开。`
        : ' 点击查看全文。'
      item.next = truncateDescription(`${item.next}${suffix}`)
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
  console.log(`  其中偏短修复：${short}`)
  console.log(`  其中偏长修复：${long}`)
}

main()
