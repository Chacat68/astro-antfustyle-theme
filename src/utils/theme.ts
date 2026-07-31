/**
 * 主题与背景 accent 色工具。
 * 与 ThemeSwitch.initTheme 使用同一数据源，避免背景组件早于
 * NavBar 内联脚本执行时，仅靠 `html.dark` 误判为浅色。
 */

/** 当前是否深色主题 */
export function isDarkTheme(): boolean {
  if (typeof document === 'undefined') return false

  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'dark' || stored === 'light') return stored === 'dark'
    }
  } catch {
    // localStorage 不可用时回退
  }

  if (document.documentElement.classList.contains('dark')) return true
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** 背景装饰用的青蓝霓虹描边色（含透明度） */
export function accentStrokeColor(): string {
  return isDarkTheme() ? '#22d3ee22' : '#0891b220'
}
