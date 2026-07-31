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
| `--page-gutter-x` | 内容区水平边距（`<640px` 为 `1.25rem`，`≥640px` 为 `1.75rem`） |
| `--nav-gutter-x` | 顶栏水平边距（手机同内容区；`≥768px` 为 `2rem`） |

正文灰阶（`--fg` / `--fg-deep` / `--fg-deeper`）定义在 `src/styles/markdown.css` 的 `.prose` 上。

**规则：** 新增组件优先引用上述 CSS 变量，避免再写硬编码灰阶或装饰色。

## 字体

`@font-face` 可定义在 `src/styles/fonts.css`（latin 子集，利于 CSP），或经 Bunny Fonts 加载；UnoCSS `fontFamily` 主题在 `unocss.config.ts` 的 `extendTheme`。

| 角色 | 字体 | 用法 |
|------|------|------|
| `font-sans` | Outfit | 全站 UI / 展示标题 / 正文拉丁部分 |
| `font-mono` | DM Mono | 代码 |
| `font-condensed` | Outfit | 压缩标签等（与 sans 同源） |
| `font-serif` | Newsreader | `em` 斜体强调（见 `markdown.css`） |

中文回退系统字体栈；不要为中文单独引入大体积 Web 字体。`Head.astro` 预加载主字重（Outfit 400/600 或本地等价文件）。

**不要**再启用 `presetWebFonts` 全量拉取（会把 greek/cyrillic/vietnamese 等子集打进 BaseLayout CSS，体积可膨胀到 100KB+）。

图标集通过 `presetIcons.collections` 从 `@iconify/json` 显式加载（见 [architecture-conventions.md](./architecture-conventions.md)），避免在 Cursor/VS Code 环境下导航图标丢失。

## Logo

`LogoButton.astro`：Studio 字标。站名 + 小号 `z` 上标；悬停轻微上浮。置于深色胶囊导航内时继承 `--c-nav-fg`。

## 语言切换

`LanguageSwitch.astro`：分段控件 `中 / EN`。两侧固定等宽槽位；文字位置不变，仅高亮块随当前语言滑动（避免 CJK/拉丁切换跳动）；当前项 `aria-current="true"`。用于顶栏 `langButton`。

## 浮层定位（搜索面板）

`SearchSwitch.astro` 的搜索面板挂在 sticky 导航内。胶囊导航**禁止**对 `.site-nav__shell` 使用 `backdrop-filter`（会形成 fixed 包含块，导致面板相对 header 而非视口定位）。

正确写法：`fixed top-50vh left-50vw translate-x--50% translate-y--50%`（`vh`/`vw` 相对视口，translate 相对面板自身）。打开搜索前才懒加载 Pagefind（见 architecture-conventions）。

## 背景与页面分配

背景调度：`src/components/backgrounds/Background.astro` → [`Ambient.astro`](../src/components/backgrounds/Ambient.astro)（CSS 色晕 + 细颗粒，无 WebGL）。

| `bgType` | 表现 | 典型页面 |
|----------|------|----------|
| `ambient` | Ambient 色晕 + 颗粒 | **全站默认**（首页、列表、文章、关于、404 等） |
| `glitch` / 旧值 `dot` / `plum` / … | 映射到 `Ambient`（兼容 frontmatter） | 历史内容 frontmatter |
| `false` | 无全局背景 | 特殊页按需关闭 |

主题色读取走 `isDarkTheme()`（`src/utils/theme.ts`）。`prefers-reduced-motion` 时关闭 Hero 漂移动画。

> Three.js `glitch-engine` 仍保留在仓库中（历史/可选扩展），但默认不再挂载。HUD / GlitchHero 设计文档见 `docs/sci-fi-hud-redesign.md`（历史参考，非当前主视觉）。

## 内容页 Studio 壳

| 区域 | 约定 |
|------|------|
| `StandardLayout` / `TabbedLayout` | `.studio-page` 内容轨；可选 `eyebrow` / `wide` / `isCentered` |
| `.studio-page` | 默认 `max-width: 65ch`；`--wide` 为 `min(75rem, 100%)` |
| `.page-eyebrow` | 小号大写眉题 + 圆点；与首页 About 同源 |
| `.page-header` | 底部分隔线 + 大标题（`clamp`）+ 副标题；**不再**用厚面板卡 |
| `.studio-tabs` | TabbedLayout 胶囊 Tab（Changelog / Feeds / Streams） |
| 列表 / 项目 / 友链 | `list-item-link` hover；`GroupItem` 为 `.group-card`（链接**勿** `aria-hidden`） |
| 卡片流 | `CardItem` 为 `.studio-card`（Highlights / Shorts） |
| GitHub 流 | `GithubItem` 摘要行圆角表面 |
| 统计 / 页脚 / 404 | `SiteStats` 表面卡；`Footer` 对齐 65ch；`.studio-empty`（404 的 code 作 `h1`） |
| `/about` | 独立完整 Studio 排版（历程 / 理念影像 / 深色 CTA），不只套 StandardLayout |
| `#main` / `.site-footer` | 水平边距用 `--page-gutter-x`，并与 `env(safe-area-inset-*)` 取 `max`；勿在 Uno 类里再写冲突的 `px-*` |
| 视口 | `viewport-fit=cover`（`Head.astro`），以便刘海屏 safe-area 生效 |

## 多端适配（断点与触控）

断点职责（Uno + 裸 CSS 对齐到同一套宽度）：

| 断点 | 宽度 | 职责 |
|------|------|------|
| 极窄 | `<380px` | Logo 缩字、header 再缩 |
| `sm` / `lt-sm` | `640px` | gutter、正文行高、blockquote/表头 nowrap 回退 |
| `md` / `lt-md` | `768px` | 列表堆叠、手机级压缩 |
| `lg` / `lt-lg` | `1024px` | **导航汉堡折叠**（`mergeOnMobile`）、顶栏紧凑 padding |
| `lgp` / `lt-lgp` | `1128px` | TOC 桌面栏 vs 浮层按钮、分组/相册内容宽 |
| `1400px` | — | 内容区悬停展开正文 TOC |

规则：

1. **水平间距只认** `--page-gutter-x` / `--nav-gutter-x`；卡片/相册外层不要再叠 `mx-10` / `mx-20`。
2. **网格**用 `minmax(min(100%, Npx), 1fr)`，禁止裸 `minmax(300px, 1fr)` 撑破窄屏。
3. **图标控件**加 `.touch-target`（`min 2.75rem` ≈ 44px）；语言切换在窄屏 / `pointer: coarse` 下同步加大。`.touch-target` **不设** `display`，避免压过 UnoCSS `hidden`；需隐藏时用 `hidden!` + 对应断点 `lt-*:inline-flex!`（见 `NavSwitch`）。
4. **挂在 `.site-nav` 内的 fixed 面板**须用 `top-50vh left-50vw`（或 portal 到 `body`），不能用 `%`。
5. **导航折叠**：`mergeOnMobile: true` 时 `<1024px` 收进汉堡；桌面文案/图标切换类（`*OnMobile`）同步以 `lg` 为界。顶栏左右槽用 `flex items-center`。
6. **触控无悬停**：相册 `figcaption` 常显（`@media (hover: none)`）。

## 全站 UI 壳层

| 区域 | 约定 |
|------|------|
| `html` | 冷灰蓝纯色底；`data-nav-rail="home\|content"` 控制导航轨宽度 |
| `.site-nav` / `.site-nav__shell` | 悬浮胶囊：深色底 + 浅色字（暗色主题反相）、圆角 pill、轻阴影；壳内 `a/button` 强制高对比（覆盖组件 `op-50/60`）；`transition:name` 跨页 morph，**不用** `persist`；**无** `backdrop-filter` |
| 导航轨宽度 | 首页 `--c-nav-max: 90rem` 对齐 Hero；其余页 `--c-nav-max: 65ch` 对齐正文轨；左右垫 `--c-rail-pad` |
| 搜索浮层 | `#search-panel` 仍在导航内；用 `50vh`/`50vw` 居中 |
| 列表 / 社交链接 | 圆角 hover、轻阴影上浮 |
| 正文链接 / `hr` | 悬停变色；分隔线克制单色 |

## 首页 Studio 展示台

路径：[`src/components/home/StudioHero.astro`](../src/components/home/StudioHero.astro) + [`HomeAbout.astro`](../src/components/home/HomeAbout.astro)，由 [`src/pages/index.astro`](../src/pages/index.astro) 挂载。

| 要点 | 约定 |
|------|------|
| Hero | 大圆角舞台（`2.5rem`）+ 氛围摄影底图 + 颗粒/遮罩 + 四角标；「关于」锚点到 `#about` |
| 文案 | i18n：`home.studio.*` / `home.about.*`；品牌名取 `SITE.title` 作 hero 级信号 |
| 关于区块 | 简介 → 理念三栏影像 → 历程时间线 → 深色联系 CTA；完整正文仍在 `/about` |
| 交互 | Hero CTA pill 悬停上浮；理念图轻微 zoom；CTA 按钮上浮 |
| 顶栏 | 显示胶囊导航；首页轨宽对齐 Hero |
| 布局 | `mainClass="home-main"` 去 padding；首页启用 Ambient 背景 |

## 样式文件分层

| 文件 | 职责 |
|------|------|
| `main.css` | Token、胶囊导航、入场动画、搜索、滚动条 |
| `prose.css` | 正文排版骨架（字号、间距、列表） |
| `markdown.css` | Markdown 增强（链接、callouts、代码、TOC） |
| `page.css` | Studio 内容壳（`.studio-page` / eyebrow / tabs / 404）、列表 hover、相册、标签筛选 |

页面级样式写在 `page.css` 或组件 `<style>` 内，并复用 token；不要在 UnoCSS shortcuts 里扩散新的硬编码色板。

## 动效原则

1. 页面入场：`slide-enter` / `slide-enter-content`（`FEATURES.slideEnterAnim`）；首屏 LCP 文案用 `slide-enter-instant`。
2. 交互反馈：列表/导航 hover 使用轻阴影上浮，避免闪屏类故障。
3. Hero：雾面缓慢漂移 + 光带轻微平移（至少 2 种有意动效）；尊重 `prefers-reduced-motion`。

## 相关配置

- PWA `theme_color` / `background_color`：`src/pages/app.webmanifest.js`（与 `--c-bg` 浅色一致）
- `<meta name="theme-color">`：`src/components/base/Head.astro`；切换主题时由 `ThemeSwitch` 同步为当前 `--c-bg`
- OG 回退背景：`FEATURES.ogImage.fallbackBgType` 使用 `plum`（Satori 可用底图）
