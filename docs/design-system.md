# 设计系统约定

本站视觉方向：**极简 antfu + 天空蓝 accent**。升级与新增样式时保持正文优先、低装饰，避免落地页式 Hero / 卡片墙 / 高饱和渐变。

## Token 来源

全局设计 token 定义在 `src/styles/main.css` 的 `:root` / `:root.dark`：

| Token | 用途 |
|-------|------|
| `--c-bg` / `--c-text` / `--c-muted` | 页面底色、正文、次要文字 |
| `--c-surface` / `--c-surface-hover` / `--c-border` | 卡片/面板表面与描边 |
| `--c-accent` / `--c-accent-soft` / `--c-accent-muted` | 品牌天空蓝（浅 `#0284c7` / 深 `#38bdf8`；交互高亮、链接 hover、选中态） |
| `--c-page-tint` | 顶部微渐变色调 |
| `--c-radius` / `--c-radius-sm` / `--c-radius-lg` | 圆角阶梯 |
| `--c-shadow` / `--c-shadow-hover` | 轻阴影 |
| `--ease-out` / `--duration` / `--duration-fast` | 动效曲线与时长 |

正文灰阶（`--fg` / `--fg-deep` / `--fg-deeper`）定义在 `src/styles/markdown.css` 的 `.prose` 上。

**规则：** 新增组件优先引用上述 CSS 变量，避免再写硬编码灰阶或蓝系装饰色。

## 字体

配置于 `unocss.config.ts` 的 `presetWebFonts`（provider: `bunny`）：

| 角色 | 字体 | 用法 |
|------|------|------|
| `font-sans` | IBM Plex Sans | 全站 UI / 正文拉丁部分 |
| `font-mono` | DM Mono | 代码 |
| `font-condensed` | IBM Plex Sans Condensed | 需要压缩显示的标签等 |
| `font-serif` | Newsreader | `em` 斜体强调（见 `markdown.css`） |

中文回退系统字体栈；不要为中文单独引入大体积 Web 字体。

图标集通过 `presetIcons.collections` 从 `@iconify/json` 显式加载（见 [architecture-conventions.md](./architecture-conventions.md)），避免在 Cursor/VS Code 环境下导航图标丢失。

## Logo

`LogoButton.astro`：左侧 HUD 角标；右侧字标用 `opacity` + 光斑 `transform/opacity` 做呼吸（避免动画 `text-shadow`）；链接强制 `op-100!` 以免与 `Link` 默认 `op-60` 叠乘过暗。尊重 `prefers-reduced-motion`。

## 首页 About 电子屏

`AboutScreen.astro`：首页科幻 HUD 面板。四角括号、扫描线、状态栏 LED、角色模块芯片均复用 `--c-accent`；文案走 `home.intro*` / `home.role.*` / `home.screen.*`。页面标题为「首页」，屏内 h1 使用 `sr-only` 隐藏。首屏继续用 `slide-enter-instant` 保 LCP；动效尊重 `prefers-reduced-motion`。

## 博客「网站数据统计」

`SiteStats.astro`（博客列表页）：经营时间 / 总字数以大号数字强调，年份分布用比例条呈现。面板、描边、填充与 hover 统一走 `--c-accent*` / `--c-surface` / `--c-border` / `--c-shadow`；条形入场动画尊重 `prefers-reduced-motion`。文案键：`sitestats.*`。

## 浮层定位

`SearchSwitch.astro` 的搜索面板挂在 sticky 导航内，而 `.site-nav` 的 `backdrop-filter` 会形成 fixed 包含块，因此不能用 `top/left: 50%`（会相对 header 而非视口）。

正确写法：`fixed top-50vh left-50vw translate-x--50% translate-y--50%`（`vh`/`vw` 相对视口，translate 相对面板自身）。

## 背景与页面分配

背景调度：`src/components/backgrounds/Background.astro`。装饰色统一贴近 accent：

| `bgType` | 组件 | 典型页面 |
|----------|------|----------|
| `wave` | SVG 正弦波（天空蓝） | 首页 |
| `dot` | p5 噪点场（天空蓝微染） | 博客列表、项目、友链 |
| `plum` | canvas 梅枝（天空蓝微染） | releases / prs |
| `rose` | SVG 花瓣 | **文章 / changelog 正文**（`RenderPost`） |
| `particle` | p5 粒子（天空蓝微染） | shorts |
| `constellation` | p5 星座（天空蓝） | 按需 |
| `false` | 无背景 | 相册、画廊、changelog 列表等内容密集页 |

## 样式文件分层

| 文件 | 职责 |
|------|------|
| `main.css` | Token、导航、入场动画、搜索、滚动条 |
| `prose.css` | 正文排版骨架（字号、间距、列表） |
| `markdown.css` | Markdown 增强（链接、callouts、代码、TOC） |
| `page.css` | 页面级节奏（列表 hover、相册、标签筛选） |

页面级样式写在 `page.css` 或组件 `<style>` 内，并复用 token；不要在 UnoCSS shortcuts 里扩散新的硬编码色板。

## 动效原则

1. 页面入场：`slide-enter` / `slide-enter-content`（`FEATURES.slideEnterAnim`）；首屏 LCP 文案用 `slide-enter-instant`。
2. 交互反馈：列表/卡片 hover 使用 `--c-accent-soft` + 轻微位移，幅度保持克制。
3. 尊重 `prefers-reduced-motion`（背景动画应停用或降级）。

## 相关配置

- PWA `theme_color` / `background_color`：`src/pages/app.webmanifest.js`（与 `--c-bg` 浅色一致）
- `<meta name="theme-color">`：`src/components/base/Head.astro`；切换主题时由 `ThemeSwitch` 同步为当前 `--c-bg`
