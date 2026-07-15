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

## 浮层定位

`SearchSwitch.astro` 的搜索面板挂在 sticky 导航内，而 `.site-nav` 的 `backdrop-filter` 会形成 fixed 包含块，因此不能用 `top/left: 50%`（会相对 header 而非视口）。

正确写法：`fixed top-50vh left-50vw translate-x--50% translate-y--50%`（`vh`/`vw` 相对视口，translate 相对面板自身）。

## 背景与页面分配

背景调度：`src/components/backgrounds/Background.astro`。装饰色统一贴近 accent：

| `bgType` | 组件 | 典型页面 |
|----------|------|----------|
| `wave` | SVG 正弦波（天空蓝） | 备用（原首页） |
| `dot` | p5 噪点场（天空蓝微染） | 博客列表、项目、友链 |
| `plum` | canvas 梅枝（天空蓝微染） | releases / prs |
| `rose` | SVG 花瓣 | **文章 / changelog 正文**（`RenderPost`） |
| `particle` | p5 粒子（天空蓝微染） | shorts |
| `constellation` | p5 星座（天空蓝） | 按需 |
| `false` | 无背景 | **首页**（改用像素小镇）、相册、画廊、changelog 列表等内容密集页 |

## 首页：像素模拟都市

首页不再使用 `wave` 装饰底，而由 `src/components/home/PixelTown.astro` 承担主视觉：

- 逻辑画布 **384×216**，`image-rendering: pixelated` 最近邻放大
- **现代都市**气质：远景天际线、玻璃幕墙楼宇、马路车流、信号灯与路灯
- 建筑热点：博客 / 项目 / 相册 / 画廊 / 友链 / **Changelog** / **GitHub·X·Bluesky·NeoDB** / **RSS**
- 轻量模拟：云、行人、车辆；深色模式夜景窗灯
- 无 p5；尊重 `prefers-reduced-motion`
- 文案：品牌「付之一笑」优先；样式在 `page.css` 的 `.home-sim*`

详细说明见 [pixel-town-home.md](./pixel-town-home.md)。

## 游戏视觉 Demo：`/arcana/`

《铁头 · Arcana》视觉方案的可交互落地见 [pixel-game-visual-design.md](./pixel-game-visual-design.md) 与页面 `/arcana/`（独立色板，不污染全站 token）。

## 样式文件分层

| 文件 | 职责 |
|------|------|
| `main.css` | Token、导航、入场动画、搜索、滚动条 |
| `prose.css` | 正文排版骨架（字号、间距、列表） |
| `markdown.css` | Markdown 增强（链接、callouts、代码、TOC） |
| `page.css` | 页面级节奏（首页 roles、列表 hover、相册、标签筛选） |

页面级样式写在 `page.css` 或组件 `<style>` 内，并复用 token；不要在 UnoCSS shortcuts 里扩散新的硬编码色板。

## 动效原则

1. 页面入场：`slide-enter` / `slide-enter-content`（`FEATURES.slideEnterAnim`）；首屏 LCP 文案用 `slide-enter-instant`。
2. 交互反馈：列表/卡片 hover 使用 `--c-accent-soft` + 轻微位移，幅度保持克制。
3. 尊重 `prefers-reduced-motion`（背景动画应停用或降级）。

## 相关配置

- PWA `theme_color` / `background_color`：`src/pages/app.webmanifest.js`（与 `--c-bg` 浅色一致）
- `<meta name="theme-color">`：`src/components/base/Head.astro`；切换主题时由 `ThemeSwitch` 同步为当前 `--c-bg`
