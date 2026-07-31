import DOMPurify from 'isomorphic-dompurify'

/**
 * Bluesky / GitHub Release·PR 等远程 HTML 允许的标签。
 * 刻意排除 script / iframe / form / style 等可执行或布局逃逸标签。
 */
const ALLOWED_TAGS = [
  'a',
  'abbr',
  'b',
  'blockquote',
  'br',
  'code',
  'del',
  'details',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'ins',
  'li',
  'ol',
  'p',
  'pre',
  's',
  'span',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'th',
  'thead',
  'tr',
  'ul',
] as const

const ALLOWED_ATTR = [
  'alt',
  'class',
  'colspan',
  'height',
  'href',
  'rel',
  'rowspan',
  'src',
  'target',
  'title',
  'width',
]

let hooksRegistered = false

/** 为带 target 的链接强制 noopener，防止 reverse tabnabbing */
function ensureSanitizeHooks() {
  if (hooksRegistered) return
  hooksRegistered = true

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!('tagName' in node) || node.tagName !== 'A') return
    if (!node.hasAttribute('target')) return

    const existing = (node.getAttribute('rel') || '')
      .split(/\s+/)
      .filter((token) => token && token !== 'opener')
    const merged = new Set([...existing, 'noopener', 'noreferrer'])
    node.setAttribute('rel', [...merged].join(' '))
  })
}

/**
 * 净化远程/不可信 HTML，供 `set:html` 使用。
 * 空输入返回空字符串；会剥离事件处理器与 javascript: URL。
 * 带 `target` 的链接会强制附带 `rel="noopener noreferrer"`。
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''

  ensureSanitizeHooks()

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  })
}
