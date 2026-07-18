# 设计系统约定

本站视觉方向：**故障艺术（Glitch）+ 天空蓝 accent**，正文优先可读。渲染引擎为 **Three.js**（首页 `hero` 舞台 + 其余页 `lite` 背景）。

## Token 来源

全局设计 token 定义在 `src/styles/main.css` 的 `:root` / `:root.dark`：

| Token | 用途 |
|-------|------|
| `--c-bg` / `--c-text` / `--c-muted` | 页面底色、正文、次要文字（冷灰系，非暖奶油） |
| `--c-surface` / `--c-surface-hover` / `--c-border` | 卡片/面板表面与描边 |
| `--c-accent` / `--c-accent-soft` / `--c-accent-muted` | 品牌天空蓝（浅 `#0284c7` / 深 `#38bdf8`） |
| `--c-glitch-red` / `--c-glitch-cyan` | 故障 RGB 辅色（悬停错位、描边投影） |
| `--c-hud-line` / `--c-hud-grid` / `--c-glow` | HUD 角标线、网格底、LED/焦点 glow（正文禁用大面积 glow） |
| `--c-page-tint` | 顶部微渐变色调 |
| `--c-radius` / `--c-radius-sm` / `--c-radius-lg` | 圆角阶梯（偏利落小圆角） |
| `--c-shadow` / `--c-shadow-hover` | 轻阴影 |
| `--ease-out` / `--duration` / `--duration-fast` | 动效曲线与时长 |

正文灰阶（`--fg` / `--fg-deep` / `--fg-deeper`）定义在 `src/styles/markdown.css` 的 `.prose` 上。

**规则：** 新增组件优先引用上述 CSS 变量，避免再写硬编码灰阶或蓝系装饰色。

## 字体

`@font-face` 定义在 `src/styles/fonts.css`（仅 **latin** 子集）；UnoCSS `fontFamily` 主题在 `unocss.config.ts` 的 `extendTheme`。

| 角色 | 字体 | 用法 |
|------|------|------|
| `font-sans` | IBM Plex Sans 400/600/700 | 全站 UI / 正文拉丁部分 |
| `font-mono` | DM Mono 400/500（600 映射到 500） | 代码与 HUD 标签 |
| `font-condensed` | IBM Plex Sans Condensed 400/600 | 需要压缩显示的标签等 |
| `font-serif` | Newsreader 400i/600i | `em` 斜体强调（见 `markdown.css`） |

中文回退系统字体栈；不要为中文单独引入大体积 Web 字体。`Head.astro` 预加载 Plex Sans 400/600。

**不要**再启用 `presetWebFonts` 全量拉取（会把 greek/cyrillic/vietnamese 等子集打进 BaseLayout CSS，体积可膨胀到 100KB+）。

图标集通过 `presetIcons.collections` 从 `@iconify/json` 显式加载（见 [architecture-conventions.md](./architecture-conventions.md)），避免在 Cursor/VS Code 环境下导航图标丢失。

## Logo

`LogoButton.astro`：故障艺术字标。左侧迷你方框（角标 + X + 底杠 + 低频扫描，呼应首页舞台）；右侧站名字标，悬停 / `:focus-visible` / 当前页显示 RGB 切片错位。无柔光光斑；链接强制 `op-100!`。尊重 `prefers-reduced-motion`。

## 语言切换

`LanguageSwitch.astro`：HUD 分段控件 `中 / EN`。两侧固定等宽槽位；文字位置不变，仅高亮块随当前语言滑动（避免 CJK/拉丁切换跳动）；当前项 `aria-current="true"`。用于顶栏 `langButton` 与首页 SYS dock。

## 浮层定位

`SearchSwitch.astro` 的搜索面板挂在 sticky 导航内，而 `.site-nav` 的 `backdrop-filter` 会形成 fixed 包含块，因此不能用 `top/left: 50%`（会相对 header 而非视口）。

正确写法：`fixed top-50vh left-50vw translate-x--50% translate-y--50%`（`vh`/`vw` 相对视口，translate 相对面板自身）。

## 背景与页面分配

背景调度：`src/components/backgrounds/Background.astro`。引擎：[`glitch-engine.ts`](../src/components/backgrounds/glitch-engine.ts)（Three.js）。

| `bgType` | 表现 | 典型页面 |
|----------|------|----------|
| `glitch` | `lite` 透明叠层：动态弧线 / 波纹 / 菱形 + 低频闪烁 | **除首页外几乎全部页面** |
| 旧值 `dot` / `plum` / `rose` / … | 映射到 `glitch`（兼容 frontmatter） | — |
| `false` | 无全局背景 | **首页**（由 Hero 自带 Three.js 舞台） |

主题色读取走 `isDarkTheme()`（`src/utils/theme.ts`）。`prefers-reduced-motion` 时只渲染静态一帧。

## 全站 UI（非首页）

| 区域 | 约定 |
|------|------|
| `html` | 冷色底 + 极淡扫描线纹理 |
| `.site-nav` | HUD 角标、当前页 accent 底线、悬停轻微 RGB text-shadow |
| `.page-header` | 斜切面板 + 四角标 + 字距加宽标题；元信息在标题上方（勿用负边距叠字）；窄屏缩小字号并加大内边距避开角标 |
| `SiteStats`（博客列表顶） | `hud-frame` + 四角 / LED / 扫描线 / mono 状态栏；指标块与年度柱对齐 AboutScreen 模块语法 |
| 列表 / 社交链接 | 斜切裁切、悬停红青双边投影 |
| 正文链接 / `hr` | 悬停 RGB 微错位；分隔线带故障色点缀 |

## 首页 Glitch 展示台

路径：[`src/components/home/GlitchHero.astro`](../src/components/home/GlitchHero.astro)，由 [`src/pages/index.astro`](../src/pages/index.astro) 挂载。

| 要点 | 约定 |
|------|------|
| 结构 | 全屏 Three.js `hero` 模式舞台 + 居中品牌字 + **右侧功能入口竖栏**（关于 / 博客 / 项目等） |
| 文案 | i18n：`home.glitch.*`（中：付之 / 一笑；英：FOO / Z） |
| 交互 | 点击入口跳转对应页面；悬停入口不改变背景故障强度（避免整屏闪烁）；桌面精确定位设备下入口默认收纳屏外仅露序号，悬停 / `:focus-visible` 滑出完整按钮 |
| 入口形态 | 右侧单列 HUD 信道块：角标 / 序号 / SRC / 悬停 RGB 错位与扫描线；≤768px 或触控 / `prefers-reduced-motion` 时展示完整按钮 |
| 舞台动效 | 弧线 / 波纹 / 能量带 / 线框常驻运动；切片与闪白保持低频 |
| 品牌故障 | Logo 方框 / 文字 / RGB 切片 / 底杠偶发闪烁错位（约 7–9.5s 周期，短促爆发）；`prefers-reduced-motion` 关闭 |
| 左下 | 社交媒体（`UI.socialLinks`，标签 `SIG`） |
| 右下 | 搜索 / 语言分段（`中 / EN`） / 日夜 / RSS / 更新日志（标签 `SYS`；顶栏 Logo+导航隐藏） |
| About | 已迁至 [`/about`](../src/pages/about.astro)（个人简介 + 博客历程 / 理念配图 + 联系方式 / 社交） |
| 布局 | 品牌区 `place-items: center`；入口绝对定位贴右并垂直居中；`mainClass="home-main"` + `minimalChrome`；首页锁 `overflow` |
| 舞台稳定 | `uTime` 周期化；监听 WebGL context lost/restored 与 `visibilitychange`，避免长时黑屏 |

## 样式文件分层

| 文件 | 职责 |
|------|------|
| `main.css` | Token、导航、入场动画、搜索、滚动条、扫描线底纹 |
| `prose.css` | 正文排版骨架（字号、间距、列表） |
| `markdown.css` | Markdown 增强（链接、callouts、代码、TOC） |
| `page.css` | 页面级节奏（header HUD、列表 hover、相册、标签筛选） |

页面级样式写在 `page.css` 或组件 `<style>` 内，并复用 token；不要在 UnoCSS shortcuts 里扩散新的硬编码色板。

## 动效原则

1. 页面入场：`slide-enter` / `slide-enter-content`（`FEATURES.slideEnterAnim`）；首屏 LCP 文案用 `slide-enter-instant`。
2. 交互反馈：列表/导航 hover 使用 accent + RGB 微错位，**闪屏类故障保持低频**。
3. 尊重 `prefers-reduced-motion`（背景动画应停用或降级）。

## 相关配置

- PWA `theme_color` / `background_color`：`src/pages/app.webmanifest.js`（与 `--c-bg` 浅色一致）
- `<meta name="theme-color">`：`src/components/base/Head.astro`；切换主题时由 `ThemeSwitch` 同步为当前 `--c-bg`
