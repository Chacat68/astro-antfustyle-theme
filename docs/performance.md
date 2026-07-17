# 性能约定

测量基线（本地/预览冷加载，禁用缓存）应关注：**FCP / LCP / CLS / 传输体积**，而非仅 Lighthouse 分数。

## 已落地优化（2026-07）

| 项 | 问题 | 做法 |
|----|------|------|
| 内页 Three.js | 每页 ~130KB gzip `glitch-engine` | `Glitch.astro` 改为纯 CSS lite；Three.js 仅首页 Hero |
| BaseLayout CSS | `presetWebFonts` 打入 40+ `@font-face`（全子集）≈135KB | `fonts.css` 仅 latin；UnoCSS `extendTheme.fontFamily` |
| KaTeX | `markdown.css` 全局 `@import`，首页也拉字体 | 仅 `RenderPost.astro` 引入 |
| Pagefind | 首屏急切 `import(pagefind.js)` ≈35KB+ | 打开搜索或 `?search=` 再加载 |
| viewerjs CSS | script 内 `import` 易进公共样式 | `?url` + 组件模板 `<link>` |

## 红线

1. 首页可加载 Three.js（idle）；**内页禁止**为装饰加载 Three.js / p5
2. 不引入中文 Web 字体大包
3. 第三方脚本（Umami / Ahrefs / Cloudflare Insights）保持 `defer`/`async`，勿阻塞首屏
4. 新增全局 CSS `@import` 前确认是否每页都需要

## 复测结果（本地 `astro preview` 冷加载，禁缓存）

| 页面 | FCP | 传输合计 | glitch-engine | Pagefind | KaTeX | viewer CSS |
|------|-----|----------|---------------|----------|-------|------------|
| `/` 优化后 | ~160ms | ~178KB（含 Hero Three.js） | idle 后有 | 无 | 无 | 无 |
| `/blog/` 优化后 | ~870ms | **~44KB** | **无** | 无 | 无 | 无 |

生产站优化前（`foo-z.com` 冷加载）首页约 FCP 2.4s / 传输 230KB，且首页误载 KaTeX、Pagefind、ImageViewer CSS；博客等内页另有 ~130KB gzip Three.js。
