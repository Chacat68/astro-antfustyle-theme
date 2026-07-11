/**
 * 将 dist/pagefind 同步到 public/pagefind，供 `pnpm dev` 本地验证真实搜索。
 * public/pagefind 已加入 .gitignore，勿提交。
 */
import { cpSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'dist', 'pagefind')
const dest = join(root, 'public', 'pagefind')

if (!existsSync(src)) {
  console.warn('[sync-pagefind-public] skip: dist/pagefind not found')
  process.exit(0)
}

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log('[sync-pagefind-public] synced dist/pagefind → public/pagefind')
