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
| `--c-content-max` / `--c-hero-max` / `--c-wide-max` | 全站页面轨宽，统一 `70rem` |
| `--c-space-nav-page` | 导航底边 ↔ 页面顶（`1.15rem` / `≥640px` 为 `1.35rem`） |
| `--c-space-page-content` | 内容页页头 ↔ 正文（`2.25rem` / `≥640px` 为 `2.5rem`） |
| `--c-space-section` | 页面大区块间距（`3.25rem` / `≥640px` 为 `3.75rem`） |
| `--c-space-block` | 区块内小间距（标题组、页脚内边距等） |
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

`LogoButton.astro`：纯文本「付之一笑」，无徽标、无底色；悬停略降透明度。置于胶囊导航内时继承 `--c-nav-fg`。

## 语言切换

`LanguageSwitch.astro`：单图标按钮（`i-ri-translate-2`），交互对齐 `ThemeSwitch`——点击跳转到另一语言的同路径页面；保留 `location.hash`（如首页 `#about`，SSR + `hashchange` / `astro:page-load` 同步）；`title` / `aria-label` 标明目标语言。用于顶栏 `langButton`。

## 浮层定位（搜索面板）

`SearchSwitch.astro` 的搜索面板挂在 sticky 导航内。胶囊导航**禁止**对 `.site-nav__shell` 使用 `backdrop-filter`（会形成 fixed 包含块，导致面板相对 header 而非视口定位）。

正确写法：`fixed top-50vh left-50vw` + `translate(-50%, -50%)`（`vh`/`vw` 相对视口，translate 相对面板自身）。打开搜索前才懒加载 Pagefind（见 architecture-conventions）。

视觉约定（Studio）：

| 要点 | 约定 |
|------|------|
| 壳层 | `.search-panel-studio`：大圆角表面、轻阴影、无 HUD 角标 / LED / 扫描线 |
| 文案 | 眉题用圆点 + `search.eyebrow`；**禁止** `SYS://`、`QUERY /`、`DOC /`、`RESULT_SET /`、`CLEAR` 等终端语气 |
| 输入 | 胶囊搜索条；焦点用 accent 描边 + soft ring，**不用** glitch 红青阴影 |
| Tab | 胶囊 Tab（对齐 `.studio-tabs`），自然大小写标签 |
| 结果 | 圆角列表项 + 轻阴影上浮选中；摘要/路径用 muted 正文色，不用 mono 前缀 |
| 类名 | `.search-panel-studio` **勿**写 `position: relative`（会压过 fixed） |

## 背景与页面分配

背景调度：`src/components/backgrounds/Background.astro` → [`Ambient.astro`](../src/components/backgrounds/Ambient.astro)（CSS 色晕 + 细颗粒，无 WebGL）。

| `bgType` | 表现 | 典型页面 |
|----------|------|----------|
| `ambient` | Ambient 色晕 + 颗粒 | **全站默认**（首页、列表、文章、关于、404 等） |
| `glitch` / 旧值 `dot` / `plum` / … | 映射到 `Ambient`（兼容 frontmatter） | 历史内容 frontmatter |
| `false` | 无全局背景 | 特殊页按需关闭 |

主题色读取走 `isDarkTheme()`（`src/utils/theme.ts`）。`prefers-reduced-motion` 时关闭 Hero 漂移动画。

> 历史 Three.js 故障背景实现已从仓库移除，当前仅使用轻量 CSS Ambient 背景。`hud.css` / `AboutScreen` / `LatestPosts` 已移除；历史 HUD 方案见 `docs/sci-fi-hud-redesign.md`（非当前主视觉）。

## 内容页 Studio 壳

| 区域 | 约定 |
|------|------|
| `StandardLayout` / `TabbedLayout` | `.studio-page` 内容轨；可选 `eyebrow` / `wide` / `isCentered`（博客列表页标题与说明居中） |
| `.studio-page` | 默认 `max-width: var(--c-content-max)`（70rem）；`--wide` 为 `min(var(--c-wide-max), 100%)` |
| `.about-page` | 关于页与首页 About 共用排版；宽度同 `--c-content-max`（70rem） |
| `.page-eyebrow` | 小号大写眉题 + 圆点；与首页 About 同源 |
| `.page-header` | 底部分隔线 + 大标题（`clamp`）+ 副标题；**不再**用厚面板卡 |
| `.studio-tabs` | TabbedLayout 页头分割线下方的居中胶囊 Tab（Changelog / Feeds / Streams），视觉与作品页标签筛选一致 |
| 列表分组 | `Categorizer`：圆点眉题 + 底部分隔线；**禁止** `SECTOR /`、描边水印、mono 科技前缀 |
| 列表 / 项目 / 友链 | 博客/日志 `list-item-link`：等宽序号 + 右侧细隔线（勿用易折行的 `[01]`）；hover 时序号转 accent，**无** `↗` 箭头。`GroupItem` 为 `.group-card`（链接**勿** `aria-hidden`）；`.group-grid` 铺满内容轨 |
| 正文 `.page-article` | h2 底部分隔线；h3 圆点 accent；blockquote 左 accent 边；图片大圆角 + 轻阴影；**禁止** HUD 渐变线 / glow 菱形 / `NOTE` 标签 / 图角标 |
| 卡片流 | `CardItem` 为 `.studio-card`（Shorts）；旧 `/highlights` 路由仅保留兼容提示页 |
| GitHub 流 | `GithubItem` 摘要行圆角表面；版本号/PR 号用 sans 半粗，不用 mono |
| 元信息 | `PostMeta` / 列表日期用正文 sans + muted；`font-mono` 仅留给代码 |
| 统计 / 页脚 / 404 | `SiteStats` 表面卡；`Footer` 对齐 `--c-nav-max`；`.studio-empty`（404 的 code 作 `h1`） |
| 首页 About | `.about-page` 完整排版（历程 / 理念影像 / 深色 CTA），挂在 `HomeAbout`；独立 `/about` 已移除 |
| `#main` / `.site-footer` | 内容页 `#main:not(.home-main)` 水平边距用 `--page-gutter-x`，并与 `env(safe-area-inset-*)` 取 `max`；首页 `.home-main` 保持 `padding: 0`（由 Hero/About 自管轨道）；勿在 Uno 类里再写冲突的 `px-*` |
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

1. **水平间距只认** `--page-gutter-x` / `--nav-gutter-x` / `--c-rail-pad`；**垂直节奏只认** `--c-space-nav-page` / `--c-space-page-content` / `--c-space-section` / `--c-space-block`。勿再写冲突的 `py-8` / 硬编码大间距。
2. **网格**用 `minmax(min(100%, Npx), 1fr)`，禁止裸 `minmax(300px, 1fr)` 撑破窄屏。
3. **图标控件**加 `.touch-target`（`min 2.75rem` ≈ 44px）。`.touch-target` **不设** `display`，避免压过 UnoCSS `hidden`；需隐藏时用 `hidden!` + 对应断点 `lt-*:inline-flex!`（见 `NavSwitch`）。
4. **挂在 `.site-nav` 内的 fixed 面板**须用 `top-50vh left-50vw`（或 portal 到 `body`），不能用 `%`。
5. **导航折叠**：`mergeOnMobile: true` 时 `<1024px` 收进汉堡；内部导航统一 `alwaysText`，功能按钮（搜索 / 语言 / 主题 / RSS）为图标。`#nav-panel` 须重置为页面色（`--c-text` / `--c-bg`），避免继承胶囊 `--c-nav-fg` 导致暗色主题看不清。顶栏左右槽用 `flex items-center`。
6. **触控无悬停**：相册 `figcaption` 常显（`@media (hover: none)`）。
7. **控件对比度**：胶囊内文字/图标相对 `--c-nav-bg`，汉堡面板相对页面 `--c-bg`；联系区 CTA 复用 `--c-nav-*`（反相块）。壳层需 `opacity: 1 !important` 覆盖组件默认 `op-60`，桌面文字入口勿再加 `op-50`。明暗切换后目标 ≥ WCAG AA（正文 4.5:1，图标可按大字号 3:1）。

## 全站 UI 壳层

| 区域 | 约定 |
|------|------|
| `html` | 冷灰蓝纯色底；`data-nav-rail="home\|content\|wide"` 控制导航轨宽度 |
| `.site-nav` / `.site-nav__shell` | 悬浮胶囊：Logo 靠左，入口/控件靠右；页面入口为文字（`alwaysText`），搜索/语言/主题/RSS 为图标；分组用 `.site-nav__divider`；`transition:name` 跨页 morph，**不用** `persist`；**无** `backdrop-filter` |
| 导航轨宽度 | 全站页面宽度统一 `--c-content-max` / `--c-hero-max` / `--c-wide-max` = `70rem`；左右垫 `--c-rail-pad` |
| 搜索浮层 | `#search-panel` 仍在导航内；`--home`/`--inner` 必须 `position: fixed` + `50vh`/`50vw` 居中。`.search-panel-studio` **勿**写 `position: relative`（会压过 fixed，面板相对导航右偏）；视觉见上方「浮层定位」 |
| 列表 / 社交链接 | 圆角 hover、轻阴影上浮 |
| 正文链接 / `hr` | 悬停变色；分隔线克制单色 |

## 首页 Studio 展示台

路径：[`src/components/home/StudioHero.astro`](../src/components/home/StudioHero.astro) + [`HomeAbout.astro`](../src/components/home/HomeAbout.astro)，由 [`src/pages/index.astro`](../src/pages/index.astro) 挂载。

| 要点 | 约定 |
|------|------|
| Hero | 70rem 大圆角纯影像舞台（无赛博角标/内框描边）；标题置左上，简介置底部；不放页面导航按钮 |
| 文案 | i18n：`home.studio.*` / `home.about.*`；页面入口集中到顶栏图标导航 |
| 关于区块 | `.about-page` 完整排版（简介 → 历程列表 → 图文理念 → 反相联系 CTA）；联系 CTA 宽屏左文案 / 右操作，社交仅图标；原 `/about` 已并入首页 `#about` |
| 顶栏 | 显示胶囊导航；首页轨宽对齐 Hero（70rem） |
| 布局 | `mainClass="home-main"` 去 padding；首页导航胶囊上下视觉间距对称（`sticky top + pad-y`，桌面约 `18.4px`；底边补偿 `2×sticky`）；内容页导航底距仍用 `--c-space-nav-page`；Hero→About / About 内区块 = `--c-space-section`；统一 70rem 轨道 |

## 样式文件分层

| 文件 | 职责 |
|------|------|
| `main.css` | Token、胶囊导航、入场动画、搜索、滚动条 |
| `prose.css` | 正文排版骨架（字号、间距、列表） |
| `markdown.css` | Markdown 增强（Studio 正文装饰、链接、callouts、代码、TOC） |
| `page.css` | Studio 内容壳（`.studio-page` / `.about-page` / eyebrow / tabs / 404）、列表 hover、相册、标签筛选 |

**不再**引入 `hud.css`；科幻 HUD primitives 已退役。

页面级样式写在 `page.css` 或组件 `<style>` 内，并复用 token；不要在 UnoCSS shortcuts 里扩散新的硬编码色板。

## 动效原则

1. 页面入场：`slide-enter` / `slide-enter-content`（`FEATURES.slideEnterAnim`）；首屏 LCP 文案用 `slide-enter-instant`。
2. 交互反馈：列表/导航 hover 使用轻阴影上浮，避免闪屏类故障。
3. Hero：雾面缓慢漂移 + 光带轻微平移（至少 2 种有意动效）；尊重 `prefers-reduced-motion`。

## 相关配置

- PWA `theme_color` / `background_color`：`src/pages/app.webmanifest.js`（与 `--c-bg` 浅色一致）
- `<meta name="theme-color">`：`src/components/base/Head.astro`；切换主题时由 `ThemeSwitch` 同步为当前 `--c-bg`
- OG 回退背景：`FEATURES.ogImage.fallbackBgType` 使用 `plum`（Satori 可用底图）
