# 设计系统约定

本站视觉方向：**Studio Agency（参考 Zypher）** — 冷灰蓝底、大圆角舞台、胶囊导航、近黑/近白 accent；正文优先可读。

## Token 来源

全局设计 token 定义在 `src/styles/main.css` 的 `:root` / `:root.dark`：

| Token | 用途 |
|-------|------|
| `--c-bg` / `--c-text` / `--c-muted` | 页面底色、正文、次要文字（浅 `#f4f6fb` / 深 `#08090b`） |
| `--c-surface` / `--c-surface-hover` / `--c-border` | 卡片/面板表面与描边 |
| `--c-accent` / `--c-accent-soft` / `--c-accent-muted` | 品牌近黑/近白（浅 `#18181b` / 深 `#f4f4f5`） |
| `--c-hero-bg` / `--c-page-tint` | Hero 舞台底与页面微晕 |
| `--c-nav-bg` / `--c-nav-fg` | 顶栏胶囊导航底色与前景 |
| `--c-glitch-red` / `--c-glitch-cyan` | 兼容旧组件的故障辅色（新 UI 不再依赖） |
| `--c-radius` / `--c-radius-sm` / `--c-radius-lg` | 圆角阶梯（偏大圆角） |
| `--c-shadow` / `--c-shadow-hover` | 轻阴影 |
| `--ease-out` / `--duration` / `--duration-fast` | 动效曲线与时长 |

正文灰阶（`--fg` / `--fg-deep` / `--fg-deeper`）定义在 `src/styles/markdown.css` 的 `.prose` 上。

**规则：** 新增组件优先引用上述 CSS 变量，避免再写硬编码灰阶或装饰色。

## 字体

配置于 `unocss.config.ts` 的 `presetWebFonts`（provider: `bunny`）：

| 角色 | 字体 | 用法 |
|------|------|------|
| `font-sans` | Outfit | 全站 UI / 展示标题 / 正文拉丁部分 |
| `font-mono` | DM Mono | 代码 |
| `font-condensed` | Outfit | 压缩标签等（与 sans 同源） |
| `font-serif` | Newsreader | `em` 斜体强调（见 `markdown.css`） |

中文回退系统字体栈；不要为中文单独引入大体积 Web 字体。

图标集通过 `presetIcons.collections` 从 `@iconify/json` 显式加载（见 [architecture-conventions.md](./architecture-conventions.md)），避免在 Cursor/VS Code 环境下导航图标丢失。

## Logo

`LogoButton.astro`：Studio 字标。站名 + 小号 `z` 上标；悬停轻微上浮。置于深色胶囊导航内时继承 `--c-nav-fg`。

## 浮层定位

`SearchSwitch.astro` 的搜索面板挂在 sticky 导航内，而 `.site-nav__shell` 的 `backdrop-filter` 会形成 fixed 包含块，因此不能用 `top/left: 50%`（会相对 header 而非视口）。

正确写法：`fixed top-50vh left-50vw translate-x--50% translate-y--50%`（`vh`/`vw` 相对视口，translate 相对面板自身）。

## 背景与页面分配

背景调度：`src/components/backgrounds/Background.astro` → [`Ambient.astro`](../src/components/backgrounds/Ambient.astro)（CSS 色晕 + 细颗粒，无 WebGL）。

| `bgType` | 表现 | 典型页面 |
|----------|------|----------|
| `glitch` / 旧值 `dot` / `plum` / … | 映射到 `Ambient`（兼容 frontmatter） | **除首页外几乎全部页面** |
| `false` | 无全局背景 | **首页**（由 StudioHero 自带氛围舞台） |

主题色读取走 `isDarkTheme()`（`src/utils/theme.ts`）。`prefers-reduced-motion` 时关闭 Hero 漂移动画。

> Three.js `glitch-engine` 仍保留在仓库中（历史/可选扩展），但默认不再挂载。

## 全站 UI（非首页）

| 区域 | 约定 |
|------|------|
| `html` | 冷灰蓝纯色底；`data-nav-rail="home\|content"` 控制导航轨宽度 |
| `.site-nav` / `.site-nav__shell` | 悬浮胶囊：深色底 + 浅色字（暗色主题反相）、圆角 pill、轻阴影；`transition:name` 做跨页 morph，**不用** `persist`（避免语言切换 / 链接陈旧） |
| 导航轨宽度 | 首页 `--c-nav-max: 90rem` 对齐 Hero；其余页 `--c-nav-max: 65ch` 对齐 `.prose`；左右垫 `--c-rail-pad` |
| 搜索浮层 | `#search-panel` 仍在导航内；胶囊**禁止** `backdrop-filter`，否则会变成 fixed 包含块导致面板偏位 |
| `.page-header` | 大圆角浅面板 + 紧字距标题 |
| 列表 / 社交链接 | 圆角 hover、轻阴影上浮 |
| 正文链接 / `hr` | 悬停变色；分隔线克制单色 |

## 首页 Studio 展示台

路径：[`src/components/home/StudioHero.astro`](../src/components/home/StudioHero.astro)，由 [`src/pages/index.astro`](../src/pages/index.astro) 挂载。

| 要点 | 约定 |
|------|------|
| 结构 | 大圆角舞台（`2.5rem`）+ CSS 氛围（雾面 / 光带 / 颗粒）+ 四角标 |
| 文案 | i18n：`home.studio.*`；品牌名取 `SITE.title` 作 hero 级信号 |
| 交互 | 主 CTA 为实心浅色 pill；次要入口为玻璃边框 pill；悬停轻微上浮 |
| 右下/底栏 | 信任短句 + 社交圆形图标 |
| 顶栏 | 显示胶囊导航（不再 `minimalChrome`） |
| 布局 | `mainClass="home-main"` 去 padding，保留页脚 |

## 样式文件分层

| 文件 | 职责 |
|------|------|
| `main.css` | Token、胶囊导航、入场动画、搜索、滚动条 |
| `prose.css` | 正文排版骨架（字号、间距、列表） |
| `markdown.css` | Markdown 增强（链接、callouts、代码、TOC） |
| `page.css` | 页面级节奏（header 面板、列表 hover、相册、标签筛选） |

页面级样式写在 `page.css` 或组件 `<style>` 内，并复用 token；不要在 UnoCSS shortcuts 里扩散新的硬编码色板。

## 动效原则

1. 页面入场：`slide-enter` / `slide-enter-content`（`FEATURES.slideEnterAnim`）；首屏 LCP 文案用 `slide-enter-instant`。
2. 交互反馈：列表/导航 hover 使用轻阴影上浮，避免闪屏类故障。
3. Hero：雾面缓慢漂移 + 光带轻微平移（至少 2 种有意动效）；尊重 `prefers-reduced-motion`。

## 相关配置

- PWA `theme_color` / `background_color`：`src/pages/app.webmanifest.js`（与 `--c-bg` 浅色一致）
- `<meta name="theme-color">`：`src/components/base/Head.astro`；切换主题时由 `ThemeSwitch` 同步为当前 `--c-bg`
- OG 回退背景：`FEATURES.ogImage.fallbackBgType` 使用 `plum`（Satori 可用底图）
