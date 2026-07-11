/**
 * `<search-panel>` 自定义元素（从 SearchSwitch.astro 拆出）
 *
 * 客户端文案通过宿主元素的 `data-i18n`（JSON）注入，
 * 键值在 `src/i18n/ui.ts` 中维护（search.* 系列）。
 */
import { toggleFadeEffect } from '~/utils/misc'
import { buildCjkQueryVariants } from '~/utils/pagefind-cjk'

interface Anchor {
  element: string
  id: string
  text: string
  location: number
}

interface WeightedLocation {
  location: number
  weight: number
  balanced_score: number
}

interface SubResult {
  title: string
  url: string
  anchor: Anchor
  weighted_locations: WeightedLocation[]
  locations: number[]
  excerpt: string
}

interface SearchPanelI18n {
  loading: string
  error: string
  noResults: string
  more: string
  all: string
  placeholder: string
  placeholderScoped: string
}

const FALLBACK_I18N: SearchPanelI18n = {
  loading: 'Loading...',
  error: 'Oops! Something went wrong. Try again.',
  noResults: 'No results found.',
  more: 'More +{count}',
  all: 'All {count}',
  placeholder: 'Search',
  placeholderScoped: 'Search {type}',
}

function formatI18n(
  template: string,
  params: Record<string, string | number>
): string {
  let text = template
  for (const [key, value] of Object.entries(params)) {
    text = text.replaceAll(`{${key}}`, String(value))
  }
  return text
}

/** 仅保留 Pagefind 可能返回的 <mark> 高亮标签，避免 innerHTML 注入风险 */
function sanitizeSearchExcerpt(html: string): string {
  return html.replace(/<[^>]+>/g, (tag) => {
    const normalized = tag.toLowerCase()
    return normalized === '<mark>' || normalized === '</mark>' ? tag : ''
  })
}

function appendSearchResultItem(
  parent: ParentNode,
  href: string,
  title: string,
  excerpt: string,
  options: { ariaSelected?: boolean } = {}
) {
  const a = document.createElement('a')
  a.href = href
  a.className = 'search-result-item'
  a.setAttribute('role', 'option')
  a.setAttribute('tabindex', '-1')
  a.setAttribute('aria-selected', options.ariaSelected ? 'true' : 'false')

  const titleEl = document.createElement('div')
  titleEl.className = 'search-result-title'
  titleEl.textContent = title

  const excerptEl = document.createElement('div')
  excerptEl.className = 'search-result-excerpt'
  excerptEl.innerHTML = sanitizeSearchExcerpt(excerpt)

  a.append(titleEl, excerptEl)
  parent.appendChild(a)
  return a
}

const fakeResults = [
  {
    meta: {
      title: '开发环境：尚未加载搜索索引',
    },
    excerpt:
      '请先执行 <mark>pnpm build</mark>（会把 Pagefind 同步到 public/pagefind），再刷新本页即可用中文搜索。',
  },
  {
    meta: {
      title: '或使用生产预览',
    },
    excerpt: '也可运行 <mark>pnpm build && pnpm preview</mark> 在预览服务中验证搜索。',
  },
]

class SearchPanel extends HTMLElement {
  #input: HTMLInputElement | null = null
  #label: HTMLLabelElement | null = null
  #results: HTMLElement | null = null
  #feedback: HTMLElement | null = null
  #content: HTMLElement | null = null
  #pagination: HTMLElement | null = null
  #btnMore: HTMLButtonElement | null = null
  #btnAll: HTMLButtonElement | null = null
  #selectedItem: HTMLAnchorElement | null = null

  #filter = this.dataset.filter === 'true'
  #tabs: HTMLElement[] = []
  #currentTab = 0

  #activeRequestId = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #allResults: any[] = []
  #renderedCount = 0
  #maxItems = this.dataset.maxItems
    ? parseInt(this.dataset.maxItems || '10', 10)
    : undefined

  #batchLoading = false
  #batchSize = this.dataset.batchSize
    ? parseInt(this.dataset.batchSize || '5', 10)
    : undefined

  #i18n: SearchPanelI18n = FALLBACK_I18N

  connectedCallback() {
    this.#input = this.querySelector('#search-input')
    this.#label = this.querySelector('#search-label')
    this.#results = this.querySelector('#search-results')
    this.#feedback = this.querySelector('#search-feedback')
    this.#content = this.querySelector('#search-content')

    this.#initI18n()
    this.#initFilter()
    this.#initPagination()

    this.#input?.addEventListener('input', this.#handleInput)

    this.#content?.addEventListener('click', this.#handleResultClick)
    this.#content?.addEventListener(
      'pointerover',
      this.#handleResultsPointerOver
    )

    this.addEventListener('keydown', this.#handleResultsKeyDown)
  }

  disconnectedCallback() {
    this.#input?.removeEventListener('input', this.#handleInput)

    this.#content?.removeEventListener('click', this.#handleResultClick)
    this.#content?.removeEventListener(
      'pointerover',
      this.#handleResultsPointerOver
    )

    this.removeEventListener('keydown', this.#handleResultsKeyDown)

    if (this.#filter)
      for (const tab of this.#tabs) tab.replaceWith(tab.cloneNode(true))
    if (this.#batchSize) {
      this.#btnMore?.removeEventListener('click', this.#handlePaginateClick)
      this.#btnAll?.removeEventListener('click', this.#handlePaginateClick)
    }

    this.#activeRequestId++
  }

  #initI18n = () => {
    const raw = this.dataset.i18n
    if (!raw) return
    try {
      this.#i18n = { ...FALLBACK_I18N, ...JSON.parse(raw) }
    } catch {
      this.#i18n = FALLBACK_I18N
    }
  }

  #initFilter = () => {
    if (!this.#filter) {
      this.#updateHint()
      return
    }

    const storedTab = localStorage.getItem('search-tab')
    this.#currentTab = storedTab ? parseInt(storedTab, 10) : 0

    this.#tabs = Array.from(this.querySelectorAll('[role="tab"]'))
    for (let i = 0; i < this.#tabs.length; i++) {
      const isSelected = i === this.#currentTab
      this.#tabs[i].setAttribute('aria-selected', isSelected.toString())
      if (isSelected) this.#updateHint(this.#tabs[i].dataset.type || '')

      this.#tabs[i].addEventListener('click', () => this.#activateTab(i))
    }
  }

  #initPagination = () => {
    if (!this.#batchSize) return

    this.#pagination = this.querySelector('#search-pagination')
    this.#btnMore = this.querySelector('[data-action="more"]')
    this.#btnAll = this.querySelector('[data-action="all"]')

    this.#btnMore?.addEventListener('click', this.#handlePaginateClick)
    this.#btnAll?.addEventListener('click', this.#handlePaginateClick)
  }

  #handleInput = async (event: Event) => {
    if (!this.#content) return
    const value = (event.target as HTMLInputElement).value.trim()

    // 有 Pagefind 时走真实搜索（PROD，或 DEV 已同步 public/pagefind）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pagefindApi = (window as any).pagefind as
      | {
          search: (
            query: string,
            options?: { filters?: Record<string, string | string[]> }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) => Promise<{ results: any[] }>
          debouncedSearch: (
            query: string,
            options?: { filters?: Record<string, string | string[]> },
            debounceMs?: number
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ) => Promise<{ results: any[] } | null>
        }
      | undefined

    if (pagefindApi) {
      const requestId = ++this.#activeRequestId
      this.#resetView()
      if (value.length === 0) return

      // start search
      try {
        const options: { filters?: Record<string, string | string[]> } = {}
        if (this.#filter && this.#tabs[this.#currentTab]) {
          const type = this.#tabs[this.#currentTab].dataset.type
          if (type) options.filters = { collection: type }
        }

        this.#showLoading(requestId)

        const res = await pagefindApi.debouncedSearch(value, options, 300)
        // a more recent search call has been made, nothing to do
        if (res === null) return
        if (requestId !== this.#activeRequestId) return

        // 中文：主搜索召回不足时，用二元/三元组变体补漏（避免「生活」类宽词刷屏）
        let results = res.results
        if (results.length < 3) {
          const variants = buildCjkQueryVariants(value).filter((q) => q !== value)
          if (variants.length > 0) {
            const extras = await Promise.all(
              variants.slice(0, 12).map((q) => pagefindApi.search(q, options))
            )
            if (requestId !== this.#activeRequestId) return
            const byId = new Map<string, (typeof results)[number]>()
            for (const r of results) byId.set(r.id, r)
            for (const extra of extras) {
              for (const r of extra.results) {
                const prev = byId.get(r.id)
                if (!prev || r.score > prev.score) byId.set(r.id, r)
              }
            }
            results = [...byId.values()].toSorted((a, b) => b.score - a.score)
          }
        }

        if (results.length === 0) {
          this.#showOnlyNoResult(requestId)
          return
        }

        this.#allResults = results
        this.#render({ requestId })
      } catch (_err) {
        this.#showOnlyError(requestId)
      }
    } else {
      if (this.#content.childElementCount > 0 && value) return
      if (!value) {
        this.#content.replaceChildren()
        return
      }
      const baseHref = this.#results?.dataset.base ?? '#'
      for (let i = 0; i < fakeResults.length; i++) {
        const result = fakeResults[i]
        appendSearchResultItem(
          this.#content,
          baseHref,
          result.meta.title,
          result.excerpt,
          { ariaSelected: i === 0 }
        )
      }
      this.#selectedItem = this.#content.querySelector('a')
    }
  }

  #handleResultClick = (event: MouseEvent) => {
    if (!this.#getLink(event)) return

    if (!window.matchMedia('(prefers-reduced-motion)').matches)
      this.classList.remove('fade-in')
    this.classList.add('hidden')
    toggleFadeEffect('backdrop', false, 'hidden')
  }

  #handleResultsPointerOver = (event: MouseEvent) => {
    const link = this.#getLink(event)
    if (!link) return

    this.#updateSlectedItem(link)
  }

  #handleResultsKeyDown = (event: KeyboardEvent) => {
    if (!this.#selectedItem || document.activeElement !== this.#input) return

    const key = event.key
    if (key !== 'ArrowDown' && key !== 'ArrowUp' && key !== 'Enter') return

    event.preventDefault()

    if (key === 'Enter') {
      this.#selectedItem.click()
      return
    }

    let target =
      key === 'ArrowDown'
        ? this.#getNextItem(this.#selectedItem)
        : this.#getPrevItem(this.#selectedItem)

    // when there's no next/prev item, loop around
    if (!target) {
      target =
        key === 'ArrowDown'
          ? (this.#content?.querySelector('a') ?? null)
          : (this.#content?.querySelector('a:last-child') ?? null)
    }

    if (target) {
      this.#updateSlectedItem(target)
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  #updateHint = (type?: string) => {
    let hint = this.#i18n.placeholder
    if (type) {
      const cap = type.charAt(0).toUpperCase() + type.slice(1)
      hint = formatI18n(this.#i18n.placeholderScoped, { type: cap }).trim()
    }

    if (this.#input) this.#input.placeholder = hint
    if (this.#label) this.#label.textContent = hint
  }

  #activateTab = async (idx: number) => {
    if (idx === this.#currentTab) return

    this.#tabs[this.#currentTab]?.setAttribute('aria-selected', 'false')
    this.#tabs[idx]?.setAttribute('aria-selected', 'true')

    this.#currentTab = idx
    localStorage.setItem('search-tab', idx.toString())

    const type = this.#tabs[idx]?.dataset.type || ''
    this.#updateHint(type)

    if (this.#input?.value) {
      this.#resetView()
      await this.#handleInput({ target: this.#input } as unknown as Event)
      this.#input?.focus()
    }
  }

  #handlePaginateClick = async (ev: MouseEvent) => {
    const btn = ev.currentTarget as HTMLButtonElement
    if (!btn || this.#batchLoading) return

    const requestId = this.#activeRequestId

    const action = btn.dataset.action
    if (action === 'more') {
      await this.#render({ requestId, next: true, all: false })
      this.#input?.focus()
    } else if (action === 'all') {
      await this.#render({ requestId, next: true, all: true })
      this.#input?.focus()
    }
  }

  #render = async ({
    requestId,
    next = false,
    all = false,
  }: {
    requestId: number
    next?: boolean
    all?: boolean
  }) => {
    if (!this.#content) return
    if (requestId !== this.#activeRequestId) return
    if (this.#batchSize && this.#batchLoading) return

    try {
      const start = this.#renderedCount
      const end =
        !this.#batchSize || all
          ? this.#allResults.length
          : Math.min(start + this.#batchSize, this.#allResults.length)

      if (next) this.#showLoading(requestId, true)

      const slice = this.#allResults.slice(start, end)
      const settled = await Promise.allSettled(slice.map((r) => r.data()))
      if (requestId !== this.#activeRequestId) return
      const fulfilled = settled.filter((s) => s.status === 'fulfilled')
      if (fulfilled.length === 0) {
        this.#showOnlyError(requestId)
        return
      }

      const frag = document.createDocumentFragment()
      for (let r = 0; r < fulfilled.length; r++) {
        if (requestId !== this.#activeRequestId) return
        const data = fulfilled[r].value

        const h1 = document.createElement('div')
        h1.className = 'search-result-h1'
        h1.textContent = data.meta?.title ?? ''
        frag.appendChild(h1)

        let subResults = data.sub_results
        if (this.#maxItems)
          subResults = this.#sortSubResults(subResults, this.#maxItems)

        for (let s = 0; s < subResults.length; s++) {
          const isFirst = r === 0 && s === 0
          if (isFirst && this.#selectedItem)
            this.#selectedItem.setAttribute('aria-selected', 'false')

          const a = appendSearchResultItem(
            frag,
            subResults[s].url,
            subResults[s].title,
            subResults[s].excerpt,
            { ariaSelected: isFirst }
          )
          if (isFirst) this.#selectedItem = a
        }
      }

      if (requestId !== this.#activeRequestId) return
      this.#showFeedback('')
      this.#content.appendChild(frag)
      this.#selectedItem?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })

      if (this.#batchSize) {
        this.#renderedCount = end
        const hasMore = this.#renderedCount < this.#allResults.length
        this.#showPagination(hasMore)
      }
    } catch (_err) {
      this.#showOnlyError(requestId)
    } finally {
      this.#results?.removeAttribute('aria-busy')
      if (this.#batchSize) this.#batchLoading = false
    }
  }

  #sortSubResults = (data: SubResult[], maxItems: number) => {
    return data
      .toSorted((a, b) => {
        const aWeightedCount = a.weighted_locations.length
        const bWeightedCount = b.weighted_locations.length
        if (aWeightedCount !== bWeightedCount) {
          return bWeightedCount - aWeightedCount
        }
        const aAvgWeight =
          a.weighted_locations.reduce((sum, loc) => sum + loc.weight, 0) /
          (aWeightedCount || 1)
        const bAvgWeight =
          b.weighted_locations.reduce((sum, loc) => sum + loc.weight, 0) /
          (bWeightedCount || 1)
        return bAvgWeight - aAvgWeight
      })
      .slice(0, maxItems)
  }

  #resetView = () => {
    this.#content?.replaceChildren()
    this.#showFeedback('')
    this.#input?.setAttribute('aria-expanded', 'false')
    this.#results?.removeAttribute('aria-busy')

    this.#allResults = []
    this.#renderedCount = 0
    this.#selectedItem = null

    if (this.#batchSize) {
      this.#batchLoading = false
      this.#showPagination(false)
    }
  }

  #showFeedback = (feedback: string) => {
    if (!this.#feedback) return
    if (feedback) this.#feedback.textContent = feedback
    this.#feedback.classList.toggle('hidden', !feedback)
  }

  #showLoading = (requestId: number, next = false) => {
    if (requestId !== this.#activeRequestId) return

    if (next) {
      this.#showPagination(false)
      this.#batchLoading = true
    }
    this.#showFeedback(this.#i18n.loading)
    this.#results?.setAttribute('aria-busy', 'true')
    if (!next) this.#input?.setAttribute('aria-expanded', 'true')
  }

  #showOnlyError = (requestId: number) => {
    if (requestId !== this.#activeRequestId) return

    this.#showFeedback(this.#i18n.error)
    this.#results?.removeAttribute('aria-busy')
  }

  #showOnlyNoResult = (requestId: number) => {
    if (requestId !== this.#activeRequestId) return

    this.#showFeedback(this.#i18n.noResults)
    this.#results?.removeAttribute('aria-busy')
  }

  #showPagination = (show: boolean) => {
    if (!this.#pagination || !this.#batchSize) return

    const all = this.#allResults.length
    const more = Math.min(this.#batchSize, all - this.#renderedCount)

    if (this.#btnMore)
      this.#btnMore.querySelector('span')!.textContent = formatI18n(
        this.#i18n.more,
        { count: more }
      )
    if (this.#btnAll)
      this.#btnAll.querySelector('span')!.textContent = formatI18n(
        this.#i18n.all,
        { count: all }
      )

    this.#pagination.style.display = show ? 'flex' : 'none'
  }

  #getLink = (event: Event) => {
    return event.target instanceof HTMLElement && event.target.closest('a')
  }

  #updateSlectedItem = (next: HTMLAnchorElement) => {
    if (!this.#selectedItem || this.#selectedItem === next) return

    this.#selectedItem.setAttribute('aria-selected', 'false')
    this.#selectedItem = next
    this.#selectedItem.setAttribute('aria-selected', 'true')
  }

  #isItem = (el: Element | null): el is HTMLAnchorElement => {
    return !!(el instanceof HTMLAnchorElement)
  }

  #getNextItem = (from: HTMLElement): HTMLAnchorElement | null => {
    let cur: Element | null = from.nextElementSibling
    while (cur) {
      if (this.#isItem(cur)) return cur
      cur = cur.nextElementSibling
    }
    return null
  }

  #getPrevItem = (from: HTMLElement): HTMLAnchorElement | null => {
    let cur: Element | null = from.previousElementSibling
    while (cur) {
      if (this.#isItem(cur)) return cur
      cur = cur.previousElementSibling
    }
    return null
  }
}

/* 点击搜索按钮打开/关闭面板 */
document.addEventListener('astro:page-load', () => {
  const handleToggle = () => {
    toggleFadeEffect('backdrop', true, 'hidden')
    toggleFadeEffect('search-panel', true, 'hidden')

    // auto-focus the search input after panel becomes visible
    requestAnimationFrame(() => {
      const input = document.getElementById('search-input')
      if (input) input.focus()
    })
  }

  const searchSwitch = document.getElementById('search-switch')
  searchSwitch?.addEventListener('click', handleToggle)
})

if (!customElements.get('search-panel'))
  customElements.define('search-panel', SearchPanel)
