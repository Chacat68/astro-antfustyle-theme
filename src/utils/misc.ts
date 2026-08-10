/**
 * Locks the scroll position of the document.
 */
export function lockScroll() {
  const bodyEl = document.body

  const scrollbarWidth = window.innerWidth - bodyEl.clientWidth
  const hasRose = document.getElementById('bg-rose')
  if (scrollbarWidth > 0 && !hasRose)
    bodyEl.style.paddingRight = `${scrollbarWidth}px`
  bodyEl.style.overflow = 'hidden'
}

/**
 * Unlocks the scroll position of the document.
 */
export function unlockScroll() {
  const bodyEl = document.body

  bodyEl.style.removeProperty('overflow')
  bodyEl.style.removeProperty('padding-right')
}

const fadeEffectRevisions = new WeakMap<HTMLElement, number>()

/**
 * Controls the fading animation of an element,
 * showing or hiding it based on visibility.
 */
export function toggleFadeEffect(
  elementId: string,
  visible: boolean,
  hiddenClass: string
) {
  const element = document.getElementById(elementId)
  if (!element) return

  const revision = (fadeEffectRevisions.get(element) ?? 0) + 1
  fadeEffectRevisions.set(element, revision)
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (visible) {
    element.classList.remove(hiddenClass)
    element.classList.remove('fade-out')
    if (elementId === 'backdrop') lockScroll()
    if (prefersReducedMotion) {
      element.classList.remove('fade-in')
      return
    }
    element.classList.add('fade-in')
  } else {
    element.classList.remove('fade-in')
    if (prefersReducedMotion) {
      element.classList.remove('fade-out')
      element.classList.add(hiddenClass)
      if (elementId === 'backdrop') unlockScroll()
      return
    }
    element.classList.add('fade-out')
    const handleAnimationEnd = (event: AnimationEvent) => {
      if (event.target !== element || event.animationName !== 'fade-out') return
      element.removeEventListener('animationend', handleAnimationEnd)
      if (fadeEffectRevisions.get(element) !== revision) return

      element.classList.remove('fade-in', 'fade-out')
      element.classList.add(hiddenClass)
      if (elementId === 'backdrop') unlockScroll()
    }
    element.addEventListener('animationend', handleAnimationEnd)
  }
}

interface FloatingPanelConfig {
  id: string
  buttonId: string
  hiddenClass: string
}

export const FLOATING_PANELS = [
  { id: 'nav-panel', buttonId: 'nav-open-button', hiddenClass: 'hidden!' },
  { id: 'toc-panel', buttonId: 'toc-open-button', hiddenClass: 'hidden!' },
  { id: 'tag-panel', buttonId: 'tag-open-button', hiddenClass: 'hidden!' },
  { id: 'search-panel', buttonId: 'search-switch', hiddenClass: 'hidden' },
] as const satisfies readonly FloatingPanelConfig[]

const getFloatingPanel = (panelId: string) =>
  FLOATING_PANELS.find(({ id }) => id === panelId)

const setPanelButtonExpanded = (buttonId: string, expanded: boolean) => {
  const button = document.getElementById(buttonId)
  if (button?.hasAttribute('aria-expanded')) {
    button.setAttribute('aria-expanded', expanded ? 'true' : 'false')
  }
}

export function isFloatingPanelOpen(panelId: string) {
  const config = getFloatingPanel(panelId)
  if (!config) return false

  const panel = document.getElementById(config.id)
  return Boolean(
    panel &&
    !panel.classList.contains(config.hiddenClass) &&
    !panel.classList.contains('fade-out')
  )
}

export function closeFloatingPanels(exceptId?: string) {
  const closed: FloatingPanelConfig[] = []

  for (const config of FLOATING_PANELS) {
    if (config.id === exceptId || !isFloatingPanelOpen(config.id)) continue

    toggleFadeEffect(config.id, false, config.hiddenClass)
    setPanelButtonExpanded(config.buttonId, false)
    closed.push(config)
  }

  return closed
}

export function openFloatingPanel(panelId: string) {
  const config = getFloatingPanel(panelId)
  if (!config) return false

  closeFloatingPanels(panelId)
  toggleFadeEffect('backdrop', true, 'hidden')
  toggleFadeEffect(config.id, true, config.hiddenClass)
  setPanelButtonExpanded(config.buttonId, true)
  return true
}

export function closeFloatingPanel(panelId: string) {
  const config = getFloatingPanel(panelId)
  if (!config) return false

  if (isFloatingPanelOpen(config.id)) {
    toggleFadeEffect(config.id, false, config.hiddenClass)
  }
  setPanelButtonExpanded(config.buttonId, false)

  const hasAnotherOpenPanel = FLOATING_PANELS.some(
    ({ id }) => id !== panelId && isFloatingPanelOpen(id)
  )
  if (!hasAnotherOpenPanel) toggleFadeEffect('backdrop', false, 'hidden')
  return true
}

export function dismissFloatingPanels() {
  const closed = closeFloatingPanels()
  toggleFadeEffect('backdrop', false, 'hidden')
  return closed
}

/**
 * Resolves a browser URL with Astro's configured base path.
 *
 * base: "/base" + trailingSlash: "ignore" -> BASE_URL: "/base"
 * base: "/base/" + trailingSlash: "ignore" -> BASE_URL: "/base/"
 */
export function withClientBasePath(path: string): string {
  const resolvedPath = `/${import.meta.env.BASE_URL}/${path}`.replace(
    /\/+/g,
    '/'
  )

  return new URL(resolvedPath, location.origin).href
}
