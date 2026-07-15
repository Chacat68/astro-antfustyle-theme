/**
 * Three.js 背景自定义元素工厂。
 * 对齐 p5-background：idle 延迟、lifecycle dispose、尊重 reduced-motion。
 */
import type { CreateGlitchOptions, GlitchHandle } from './glitch-engine'
import { isDarkTheme } from '~/utils/theme'

type EngineFactory = (
  container: HTMLElement,
  options: CreateGlitchOptions
) => GlitchHandle

export function defineThreeBackground(
  tagName: string,
  createEngine: () => Promise<EngineFactory>,
  baseOptions: CreateGlitchOptions = {}
) {
  if (customElements.get(tagName)) return

  class ThreeBackgroundElement extends HTMLElement {
    #handle: GlitchHandle | null = null
    #idleHandle: number | null = null
    #cancelled = false
    #themeObserver: MutationObserver | null = null

    connectedCallback() {
      if (this.#handle) return
      this.#cancelled = false

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      // 减少动效时仍渲染一帧静态故障底，保持视觉语言一致
      const start = async () => {
        this.#idleHandle = null
        const factory = await createEngine()
        if (!this.isConnected || this.#cancelled || this.#handle) return

        this.#handle = factory(this, {
          ...baseOptions,
          reducedMotion,
          isDark: isDarkTheme(),
        })

        this.#themeObserver = new MutationObserver(() => {
          this.#handle?.setDark(isDarkTheme())
        })
        this.#themeObserver.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        })
      }

      if (typeof requestIdleCallback === 'function') {
        this.#idleHandle = requestIdleCallback(() => start(), {
          timeout: reducedMotion ? 800 : 1600,
        })
      } else {
        void start()
      }
    }

    disconnectedCallback() {
      this.#cancelled = true
      if (this.#idleHandle !== null) {
        cancelIdleCallback(this.#idleHandle)
        this.#idleHandle = null
      }
      this.#themeObserver?.disconnect()
      this.#themeObserver = null
      this.#handle?.dispose()
      this.#handle = null
    }
  }

  customElements.define(tagName, ThreeBackgroundElement)
}
