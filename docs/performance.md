# 性能约定

测量基线（本地/预览冷加载，禁用缓存）应关注：**FCP / LCP / CLS / 传输体积**，而非仅 Lighthouse 分数。

## 已落地优化

| 项 | 问题 | 做法 |
|----|------|------|
| BaseLayout CSS | `presetWebFonts` 打入 40+ `@font-face`（全子集）≈135KB | `fonts.css` 仅 latin；UnoCSS `extendTheme.fontFamily` |
| KaTeX | 全局样式拖慢非公式页 | `rehype-katex` 仍处理公式 HTML；**勿**在 `markdown.css` 全局 `@import` KaTeX CSS；有公式页再按需引入样式 |
| Pagefind | 首屏急切 `import(pagefind.js)` ≈35KB+ | 打开搜索或 `?search=` 再加载；SPA（View Transitions）落到 `?search=` 时在 `astro:page-load` 中 `await` 装载高亮后再 `highlight()` |
| viewerjs | 组件挂载即拉取 JS/CSS | `ImageViewer` 首次点击图片再 `import('viewerjs')` 并注入 CSS |
| 正文远程图 | 无 `loading` | `rehype-optimize-images`：首图 `eager` + `fetchpriority=high`，其余 `lazy` + `decoding=async` |
| 静态资源缓存 | `_astro` / Pagefind 无长缓存 | `public/_headers`：`/_astro/*`、`/pagefind/*` → `max-age=31536000, immutable` |

全站背景默认 Ambient（CSS 色晕 + 细颗粒）。`Glitch.astro` / Three.js 保留源码但**默认不挂载**（`Background.astro` 将旧 `glitch` 等枚举映射到 Ambient）。

首页 Hero 使用 `astro:assets` WebP + `loading="eager"` / `fetchpriority="high"`；About 配图 `loading="lazy"`。

## 红线

1. 禁止在默认路径重新挂载 Three.js / 第二套重引擎（如 p5）
2. 不引入中文 Web 字体大包
3. 第三方脚本（Umami / Ahrefs / Cloudflare Insights）保持 `defer`/`async`，勿阻塞首屏
4. 新增全局 CSS `@import` 前确认是否每页都需要
5. Pagefind / KaTeX CSS / viewerjs：按需加载，不进首屏急切路径
6. 腾讯云 COS **不要**加入 `SITE.imageDomains`（境外 Cloudflare Builds 拉图易超时）；正文 COS 图走原链 + CDN `imageSlim` / `imageMogr2`，宽高尽量在 markdown 用 `remark-imgattr` 声明以降低 CLS

## 复测要点

- `/`：未点击图片前无 `viewer*.css` / `viewerjs` chunk；无 katex / pagefind（未开搜索）；背景为 Ambient，无 `glitch-engine`
- `/blog/`：同上；打开搜索后 Pagefind 正常
- 文章页：正文非首图带 `loading="lazy"`；点击图片后才加载 viewerjs
- 有公式的文章：确认 KaTeX 样式按约定引入后渲染正常

## 已知限制

- COS 远程图未走 Astro `Image` 优化（构建策略限制），缺 `width`/`height` 时仍可能 CLS；新文请用 `![](url)(width:…, height:…)` 或 CDN 裁剪参数补尺寸。
