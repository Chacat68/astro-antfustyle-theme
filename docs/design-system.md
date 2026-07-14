# 设计系统约定

本站视觉方向：**极简 antfu + 青蓝 HUD（克制科幻）**。升级与新增样式时保持正文优先、低装饰，避免落地页式 Hero / 卡片墙 / 高饱和渐变。

> 改造方案全文：[sci-fi-hud-redesign.md](./sci-fi-hud-redesign.md)

## Token 来源

全局设计 token 定义在 `src/styles/main.css` 的 `:root` / `:root.dark`：

| Token | 用途 |
|-------|------|
| `--c-bg` / `--c-text` / `--c-muted` | 页面底色、正文、次要文字 |
| `--c-surface` / `--c-surface-hover` / `--c-border` | 卡片/面板表面与描边 |
| `--c-accent` / `--c-accent-soft` / `--c-accent-muted` | 品牌青蓝（浅 `#0891b2` / 深 `#22d3ee`；交互高亮、链接 hover、选中态） |
| `--c-page-tint` | 顶部微渐变色调 |
| `--c-hud-line` / `--c-hud-grid` / `--c-glow` | HUD 描边、网格底、发光（glow 仅 Logo / LED / 焦点） |
| `--c-radius` / `--c-radius-sm` / `--c-radius-lg` | 圆角阶梯（略收锐） |
| `--c-shadow` / `--c-shadow-hover` | 轻阴影 |
| `--ease-out` / `--duration` / `--duration-fast` | 动效曲线与时长 |

正文灰阶（`--fg` / `--fg-deep` / `--fg-deeper`）定义在 `src/styles/markdown.css` 的 `.prose` 上。

**规则：** 新增组件优先引用上述 CSS 变量，避免再写硬编码灰阶或蓝系装饰色。

## HUD Primitives

共享样式在 `src/styles/hud.css`（由 `BaseLayout` 引入）：

| 类名 | 用途 |
|------|------|
| `.hud-frame` | 面板表面 + accent 描边 |
| `.hud-corner` + `--tl/tr/bl/br` | 四角括号 |
| `.hud-scanlines` | 扫描线叠层 |
| `.hud-led` / `.hud-led--sm` | 状态 LED |
| `.hud-label` / `.hud-status` | mono 标签与状态栏 |

导航底线与 active underline 也在此文件。尊重 `prefers-reduced-motion`。

## 字体

配置于 `unocss.config.ts` 的 `presetWebFonts`（provider: `bunny`）：

| 角色 | 字体 | 用法 |
|------|------|------|
| `font-sans` | IBM Plex Sans | 全站 UI / 正文拉丁部分 |
| `font-mono` | DM Mono | 代码、HUD 标签、PostMeta、列表日期 |
| `font-condensed` | IBM Plex Sans Condensed | 需要压缩显示的标签等 |
| `font-serif` | Newsreader | `em` 斜体强调（见 `markdown.css`） |

中文回退系统字体栈；不要为中文单独引入大体积 Web 字体。

图标集通过 `presetIcons.collections` 从 `@iconify/json` 显式加载（见 [architecture-conventions.md](./architecture-conventions.md)），避免在 Cursor/VS Code 环境下导航图标丢失。

## Logo

`LogoButton.astro`：左侧 HUD 角标；右侧字标用 `opacity` + 光斑 `transform/opacity` 做呼吸（避免动画 `text-shadow`）；链接强制 `op-100!` 以免与 `Link` 默认 `op-60` 叠乘过暗。发光用 `--c-glow`。尊重 `prefers-reduced-motion`。

## 首页 About 电子屏

`AboutScreen.astro`：首页科幻 HUD 面板，消费 `.hud-frame` / `.hud-corner` / `.hud-scanlines` / `.hud-led` / `.hud-label`。文案走 `home.intro*` / `home.role.*` / `home.screen.*`。页面标题为「首页」，屏内 h1 使用 `sr-only` 隐藏。首屏继续用 `slide-enter-instant` 保 LCP。

## 浮层定位

`SearchSwitch.astro` 的搜索面板挂在 sticky 导航内，而 `.site-nav` 的 `backdrop-filter` 会形成 fixed 包含块，因此不能用 `top/left: 50%`（会相对 header 而非视口）。

正确写法：`fixed top-50vh left-50vw translate-x--50% translate-y--50%`（`vh`/`vw` 相对视口，translate 相对面板自身）。

搜索面板使用 `.search-panel-hud` + 角标 + `>` prompt，背景/边框走 token。

## 背景与页面分配

背景调度：`src/components/backgrounds/Background.astro`。装饰色统一贴近 accent（`accentStrokeColor()` / CSS `var(--c-accent)`）：

| `bgType` | 组件 | 典型页面 |
|----------|------|----------|
| `wave` | SVG 正弦波（青蓝） | 首页 |
| `dot` | p5 噪点场（青蓝微染） | 博客列表、项目、友链、releases / prs |
| `plum` | canvas 梅枝 | 按需（默认页已改用 `dot`） |
| `rose` | SVG 花瓣 | 按需（文章正文默认无背景） |
| `particle` | p5 粒子（青蓝微染） | shorts |
| `constellation` | p5 星座（青蓝） | 按需 |
| `false` | 无背景 | 文章正文、相册、画廊、changelog 列表等内容密集页 |

## 样式文件分层

| 文件 | 职责 |
|------|------|
| `main.css` | Token、导航、入场动画、搜索、滚动条 |
| `hud.css` | HUD primitives、导航底线 |
| `prose.css` | 正文排版骨架（字号、间距、列表） |
| `markdown.css` | Markdown 增强（链接、callouts、代码、TOC） |
| `page.css` | 页面级节奏（列表 hover、相册、标签筛选） |

页面级样式写在 `page.css` 或组件 `<style>` 内，并复用 token；不要在 UnoCSS shortcuts 里扩散新的硬编码色板。

## 动效原则

1. 页面入场：`slide-enter` / `slide-enter-content`（`FEATURES.slideEnterAnim`）；首屏 LCP 文案用 `slide-enter-instant`。
2. 交互反馈：列表/卡片 hover 使用 `--c-accent-soft` + 轻微位移，幅度保持克制。
3. 尊重 `prefers-reduced-motion`（背景动画应停用或降级）。
4. 禁止全屏 glitch / 正文区强 glow；装饰 opacity ≤ 15%。

## 相关配置

- PWA `theme_color` / `background_color`：`src/pages/app.webmanifest.js`（与 `--c-bg` 浅色一致：`#f4f7f9`）
- `<meta name="theme-color">`：`src/components/base/Head.astro`；切换主题时由 `ThemeSwitch` 同步为当前 `--c-bg`
