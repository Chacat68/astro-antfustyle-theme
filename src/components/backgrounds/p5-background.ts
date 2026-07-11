/**
 * p5 背景动画的公共自定义元素工厂。
 *
 * - 统一封装 p5 的动态加载与实例生命周期（连接时创建、断开时销毁）
 * - 通过 requestIdleCallback 延迟初始化，避免与首屏渲染争用主线程
 */
import type { default as P5Instance } from 'p5'

export type P5Sketch = (p: P5Instance) => void

export function defineP5Background(tagName: string, sketch: P5Sketch) {
  if (customElements.get(tagName)) return

  class P5BackgroundElement extends HTMLElement {
    p5Instance: P5Instance | null = null
    #idleHandle: number | null = null
    #cancelled = false

    connectedCallback() {
      if (this.p5Instance) return
      this.#cancelled = false

      // 尊重系统「减少动态效果」偏好，不加载 ~1MB p5
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const start = async () => {
        this.#idleHandle = null
        const { default: p5 } = await import('p5')
        if (!this.isConnected || this.#cancelled || this.p5Instance) return
        this.p5Instance = new p5(sketch, this)
      }

      if (typeof requestIdleCallback === 'function') {
        this.#idleHandle = requestIdleCallback(() => start(), {
          timeout: 1500,
        })
      } else {
        start()
      }
    }

    // after switching pages, stop the animation loop
    disconnectedCallback() {
      this.#cancelled = true
      if (this.#idleHandle !== null) {
        cancelIdleCallback(this.#idleHandle)
        this.#idleHandle = null
      }
      if (this.p5Instance) {
        this.p5Instance.remove()
        this.p5Instance = null
      }
    }
  }

  customElements.define(tagName, P5BackgroundElement)
}
