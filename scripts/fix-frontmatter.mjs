#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const enDir = path.join(projectRoot, 'src/content/blog/en')

const TARGET_KEYS = new Set([
  'title',
  'subtitle',
  'description',
  'category',
  'image',
  'redirect',
])

async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) out.push(...(await listMarkdownFiles(full)))
    else if (
      ent.isFile() &&
      (ent.name.endsWith('.md') || ent.name.endsWith('.mdx'))
    )
      out.push(full)
  }
  return out
}

function shouldQuote(value) {
  if (!value) return false
  const v = value.trim()
  if (!v) return false

  // already quoted or complex YAML
  if (
    v.startsWith('"') ||
    v.startsWith("'") ||
    v.startsWith('[') ||
    v.startsWith('{') ||
    v.startsWith('|') ||
    v.startsWith('>')
  )
    return false

  // YAML plain scalars break easily with these
  if (v.includes(': ')) return true
  if (v.includes(' #')) return true
  if (v.startsWith('#')) return true

  return false
}

function unwrapOuterQuotes(value) {
  const v = value.trim()
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  )
    return v.slice(1, -1)
  return v
}

function hasUnsafeSingleQuotedString(value) {
  const v = value.trim()
  if (!(v.startsWith("'") && v.endsWith("'"))) return false

  // YAML 单引号字符串内部如果出现单引号，需要写成 ''。
  // 这里粗略判断：去掉两侧引号后仍包含单引号字符，则认为不安全，直接转成 JSON 字符串。
  const inner = v.slice(1, -1)
  return inner.includes("'")
}

function hasUnterminatedQuotedString(value) {
  const v = value.trim()
  if (v.startsWith('"') && !v.endsWith('"')) return true
  if (v.startsWith("'") && !v.endsWith("'")) return true
  return false
}

function fixFrontmatter(raw) {
  if (!raw.startsWith('---')) return { updated: raw, changed: false }

  const lines = raw.split(/\r?\n/)
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i
      break
    }
  }
  if (end === -1) return { updated: raw, changed: false }

  const fm = lines.slice(1, end)
  const rest = lines.slice(end + 1)

  let changed = false
  const updatedFm = fm.map((line) => {
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!m) return line

    const key = m[1]
    const value = m[2]

    if (!TARGET_KEYS.has(key)) return line

    if (hasUnterminatedQuotedString(value)) {
      changed = true
      return `${key}: ${JSON.stringify(value.trim())}`
    }

    if (hasUnsafeSingleQuotedString(value)) {
      changed = true
      return `${key}: ${JSON.stringify(unwrapOuterQuotes(value))}`
    }

    if (!shouldQuote(value)) return line

    changed = true
    return `${key}: ${JSON.stringify(value.trim())}`
  })

  return {
    updated: ['---', ...updatedFm, '---', ...rest].join('\n'),
    changed,
  }
}

async function main() {
  const files = await listMarkdownFiles(enDir)
  let fixed = 0
  for (const filePath of files) {
    const raw = await fs.readFile(filePath, 'utf8')
    const { updated, changed } = fixFrontmatter(raw)
    if (changed) {
      await fs.writeFile(filePath, updated, 'utf8')
      fixed += 1
      // eslint-disable-next-line no-console
      console.log(`fixed: ${path.relative(enDir, filePath)}`)
    }
  }

  // eslint-disable-next-line no-console
  console.log(`\nDone. Fixed ${fixed} file(s).`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
