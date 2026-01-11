#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const projectRoot = process.cwd()
const zhDir = path.join(projectRoot, 'src/content/blog/zh')
const enDir = path.join(projectRoot, 'src/content/blog/en')

function parseArgs(argv) {
  const args = {
    files: [],
    overwrite: false,
    limit: Infinity,
    provider: process.env.TRANSLATE_PROVIDER || 'deepseek',
    baseUrl: undefined,
    model: undefined,
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--file' || a === '-f') {
      args.files.push(argv[++i])
    } else if (a === '--overwrite') {
      args.overwrite = true
    } else if (a === '--limit') {
      args.limit = Number(argv[++i] ?? '0')
    } else if (a === '--provider') {
      args.provider = String(argv[++i] ?? args.provider)
    } else if (a === '--base-url') {
      args.baseUrl = String(argv[++i] ?? '')
    } else if (a === '--model') {
      args.model = String(argv[++i] ?? args.model)
    } else if (a === '--help' || a === '-h') {
      printHelp()
      process.exit(0)
    }
  }

  if (!Number.isFinite(args.limit) || args.limit <= 0) args.limit = Infinity

  return args
}

function printHelp() {
  // eslint-disable-next-line no-console
  console.log(`
Translate blog posts from zh -> en using DeepSeek (OpenAI-compatible API).

Usage:
  node scripts/translate-blog.mjs [options]

Options:
  -f, --file <name>     Translate a single file (repeatable), e.g. ai1.md
  --limit <n>           Max files to translate this run (default: unlimited)
  --overwrite           Overwrite existing en files
  --provider <name>     Provider: deepseek | openai (default: deepseek)
  --base-url <url>      Override API base URL (OpenAI-compatible), e.g. https://api.deepseek.com/v1
  --model <name>        Model name (default depends on provider)

Env (DeepSeek):
  DEEPSEEK_API_KEY      Required
  DEEPSEEK_MODEL        Optional (default: deepseek-chat)
  DEEPSEEK_BASE_URL     Optional (default: https://api.deepseek.com/v1)

Env (OpenAI):
  OPENAI_API_KEY        Required
  OPENAI_MODEL          Optional
  OPENAI_BASE_URL       Optional

Examples:
  DEEPSEEK_API_KEY=... pnpm translate:blog
  DEEPSEEK_API_KEY=... pnpm translate:blog -- --limit 5
  DEEPSEEK_API_KEY=... pnpm translate:blog -- --model deepseek-chat
  OPENAI_API_KEY=... pnpm translate:blog -- --provider openai --limit 5
`)
}

async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const out = []
  for (const ent of entries) {
    const full = path.join(dir, ent.name)
    if (ent.isDirectory()) {
      out.push(...(await listMarkdownFiles(full)))
    } else if (
      ent.isFile() &&
      (ent.name.endsWith('.md') || ent.name.endsWith('.mdx'))
    ) {
      out.push(full)
    }
  }
  return out
}

function addOrReplaceLangFrontmatter(markdown, langValue) {
  if (!markdown.startsWith('---')) return markdown

  const lines = markdown.split(/\r?\n/)
  let end = -1
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i
      break
    }
  }
  if (end === -1) return markdown

  const fm = lines.slice(1, end)
  const rest = lines.slice(end + 1)

  let found = false
  const updated = fm.map((l) => {
    if (/^lang\s*:/i.test(l.trim())) {
      found = true
      return `lang: ${langValue}`
    }
    return l
  })

  if (!found) updated.push(`lang: ${langValue}`)

  return ['---', ...updated, '---', ...rest].join('\n')
}

function resolveChatCompletionsUrl(baseUrl) {
  const trimmed = String(baseUrl || '').trim()
  const normalized = trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
  return `${normalized}/chat/completions`
}

async function chatTranslate({ apiKey, baseUrl, model, input }) {
  const res = await fetch(resolveChatCompletionsUrl(baseUrl), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'You are a professional translator. Translate Chinese Markdown posts into fluent, natural English. Keep Markdown structure, links, code blocks, and image URLs unchanged. Keep YAML frontmatter keys unchanged; translate only human-facing text fields and the body. Output ONLY the translated Markdown with no extra commentary.',
        },
        {
          role: 'user',
          content: input,
        },
      ],
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    const err = new Error(
      `Chat Completions API error: ${res.status} ${res.statusText}\n${text}`
    )
    err.status = res.status
    throw err
  }

  const json = await res.json()
  const content = json?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Chat Completions API returned empty content')
  }
  return content
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function translateWithRetry({ apiKey, model, input, relPath }) {
  const maxAttempts = 6
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await chatTranslate({
        apiKey,
        baseUrl: model.baseUrl,
        model: model.name,
        input,
      })
    } catch (err) {
      const status = err?.status
      const retryable =
        status === 429 || (typeof status === 'number' && status >= 500)
      if (!retryable || attempt === maxAttempts) throw err

      const backoffMs = Math.min(120000, 1500 * 2 ** (attempt - 1))
      const jitterMs = Math.floor(Math.random() * 500)
      // eslint-disable-next-line no-console
      console.warn(
        `retry (${attempt}/${maxAttempts}) after ${backoffMs + jitterMs}ms: ${relPath} (status ${status})`
      )
      await sleep(backoffMs + jitterMs)
    }
  }
  throw new Error('unreachable')
}

function resolveProviderConfig(args) {
  const provider = String(args.provider || 'deepseek').toLowerCase()

  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY
    const baseUrl =
      args.baseUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    const model = args.model || process.env.OPENAI_MODEL || 'gpt-4o-mini'
    return {
      provider,
      apiKey,
      baseUrl,
      model,
      missingKeyMessage: 'Missing OPENAI_API_KEY. Run with --help for usage.',
    }
  }

  // Default: DeepSeek (OpenAI-compatible)
  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseUrl =
    args.baseUrl ||
    process.env.DEEPSEEK_BASE_URL ||
    'https://api.deepseek.com/v1'
  const model = args.model || process.env.DEEPSEEK_MODEL || 'deepseek-chat'
  return {
    provider: 'deepseek',
    apiKey,
    baseUrl,
    model,
    missingKeyMessage: 'Missing DEEPSEEK_API_KEY. Run with --help for usage.',
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const provider = resolveProviderConfig(args)
  if (!provider.apiKey) {
    // eslint-disable-next-line no-console
    console.error(provider.missingKeyMessage)
    process.exit(1)
  }

  await fs.mkdir(enDir, { recursive: true })

  let files = []
  if (args.files.length) {
    files = args.files.map((name) => path.join(zhDir, name))
  } else {
    files = await listMarkdownFiles(zhDir)
  }

  let done = 0
  let skipped = 0
  let failed = 0
  for (const filePath of files) {
    if (done >= args.limit) break

    const rel = path.relative(zhDir, filePath)
    const outPath = path.join(enDir, rel)

    await fs.mkdir(path.dirname(outPath), { recursive: true })

    try {
      if (!args.overwrite) {
        await fs.access(outPath)
        // eslint-disable-next-line no-console
        console.log(`skip (exists): ${rel}`)
        skipped += 1
        continue
      }
    } catch {
      // doesn't exist
    }

    const input = await fs.readFile(filePath, 'utf8')
    // eslint-disable-next-line no-console
    console.log(`translating: ${rel}`)

    try {
      const translated = await translateWithRetry({
        apiKey: provider.apiKey,
        model: { name: provider.model, baseUrl: provider.baseUrl },
        input,
        relPath: rel,
      })
      const withLang = addOrReplaceLangFrontmatter(translated, 'en')

      await fs.writeFile(outPath, withLang, 'utf8')
      done += 1
    } catch (err) {
      failed += 1
      // eslint-disable-next-line no-console
      console.error(`failed: ${rel}`)
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `\nDone. Translated ${done} file(s). Skipped ${skipped}. Failed ${failed}.`
  )
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
