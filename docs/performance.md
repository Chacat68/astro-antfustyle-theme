# 性能约定

测量基线（本地/预览冷加载，禁用缓存）应关注：**FCP / LCP / CLS / 传输体积**，而非仅 Lighthouse 分数。

## 已落地优化（2026-07）

| 项 | 问题 | 做法 |
|----|------|------|
| BaseLayout CSS | `presetWebFonts` 打入 40+ `@font-face`（全子集）≈135KB | `fonts.css` 仅 latin；UnoCSS `extendTheme.fontFamily` |
| KaTeX | `markdown.css` 全局 `@import`，首页也拉字体 | 仅 `RenderPost.astro` 引入 |
| Pagefind | 首屏急切 `import(pagefind.js)` ≈35KB+ | 打开搜索或 `?search=` 再加载 |
| viewerjs CSS | script 内 `import` 易进公共样式 | `?url` + 组件模板 `<link>` |

内页背景仍用 Three.js `lite`（`Glitch.astro`，idle 延迟），以视觉为准，不为此换成纯 CSS。

## 红线

1. Three.js 仅用于故障背景（首页 `hero` / 内页 `lite`），idle 延迟；禁止再挂第二套重引擎（如 p5）
2. 不引入中文 Web 字体大包
3. 第三方脚本（Umami / Ahrefs / Cloudflare Insights）保持 `defer`/`async`，勿阻塞首屏
4. 新增全局 CSS `@import` 前确认是否每页都需要
5. Pagefind / KaTeX / viewerjs：按需加载，不进首屏急切路径

## 复测要点

- `/`：无 katex / pagefind（未开搜索）/ viewer CSS；idle 后有 `glitch-engine`（Hero）
- `/blog/`：idle 后有 `glitch-engine`（lite）；无 katex / pagefind（未开搜索）
- 打开搜索后 Pagefind 正常；正文公式页 KaTeX 样式正常
