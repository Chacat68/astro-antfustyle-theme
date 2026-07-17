# 架构与代码约定

本文档记录 2026-06 优化重构后确立的代码组织约定，新增代码应遵循这些模式。

## i18n 约定

语言配置集中在 `src/i18n/`：

| 文件 | 职责 |
|------|------|
| `locales.ts` | 语言常量与 helper：`DEFAULT_LOCALE`（zh）、`isDefaultLocale()`、`getAlternateLocale()`、`pickLocalized()` |
| `ui.ts` | 所有 UI 文案键值（zh / en 两份） |
| `translate.ts` | `getLocale()` / `t()` / `useTranslations()` |

**规则：**

1. **禁止硬编码 `locale === 'zh' / 'en'`**。路由相关判断使用 `isDefaultLocale(locale)`，语言切换使用 `getAlternateLocale(locale)`。
2. **页面文案不写在页面 frontmatter 里**，统一走 `ui.ts` 的 `page.*` 键。页面顶部仅保留行为配置（`bgType` / `toc` / `ogImage`）。
3. **导航文案**由 `ui.ts` 的 `nav.*` 键提供（`NavBar.astro` 中 `navKeyByPath` 映射）；`src/config.ts` 中 `internalNavs` 的 `title`/`text` 仅作 fallback。

### 客户端脚本的 i18n

客户端（Custom Element / inline script）无法直接调用 `t()`，约定通过 data 属性注入：

- `SearchSwitch.astro` → `<search-panel data-i18n='{...}'>`，由 `search-panel.ts` 解析（`search.*` 键）。
- `ThemeSwitch.astro` → 按钮上 `data-label-light` / `data-label-dark`。

新增带文案的客户端组件时遵循同样模式：SSR 端用 `t()` 序列化进 data 属性，客户端读取并提供英文 fallback。

### 数据集合的双语化（projects / friends）

`src/content/projects/data.json`、`src/content/friends/data.json` 采用「中文为主 + 可选英文字段」模式：

```json
{
  "desc": "中文描述",
  "descEn": "English description",
  "category": "技术探索",
  "categoryEn": "Tech Explorations"
}
```

- `descEn` / `categoryEn` 为可选字段（见 `src/content/schema.ts`），缺省时英文路由回退中文。
- 渲染端通过 `pickLocalized(locale, zhValue, enValue)` 取值（见 `GroupView.astro`）。

## 组件组织

- **`src/components/nav/NavBarSlot.astro`**：导航栏单侧组件序列渲染，`NavBar.astro` 左右两侧复用，新增导航组件类型时只改这一处。
- **`src/components/widgets/search-panel.ts`**：`<search-panel>` 自定义元素完整逻辑，`SearchSwitch.astro` 仅保留模板与 Pagefind 装载脚本。
- **站内搜索（Pagefind）**：`postbuild` 使用 Pagefind **≥ 1.5**，`--force-language zh-cn` 统一索引；`pagefind.init('zh-cn')`。`noindex` 页（英文回退中文稿）不入索引，避免重复占位。正文内注入标题/标签及 CJK 整词·单字·二元组增强召回；查询侧对中文做变体搜索合并。`postbuild` 同步索引到 `public/pagefind/`（gitignore）供 `pnpm dev` 联调。
- **`src/components/backgrounds/glitch-engine.ts`**：首页 `GlitchHero` 的 Three.js `hero` 舞台（idle 延迟挂载、主题 MutationObserver、`prefers-reduced-motion` 静态帧）。
- **`src/components/backgrounds/Glitch.astro`**：默认全站 **纯 CSS** lite 背景（网格/噪声/扫描线）；`Background.astro` 将旧 `bgType`（dot/plum/rose…）统一渲染为 glitch。内页不再下载 Three.js。
- **`src/components/backgrounds/three-background.ts`**：历史 CE 工厂，现仅作参考/备用（lite 已改 CSS）；新背景优先 CSS/SVG。
- **首页展示台**：[`GlitchHero.astro`](../src/components/home/GlitchHero.astro) 自挂 Three.js `hero` 模式；品牌字居中，功能入口为右侧竖栏（默认收纳屏外仅露序号，悬停滑出；窄屏 / 触控回落到完整按钮）；`bgType: false` 避免双 canvas。About 内容在 [`/about`](../src/pages/about.astro)（文案见 `i18n` 的 `about.*`；理念配图在 `src/assets/about/`）。
- **字体**：`src/styles/fonts.css` 仅 latin `@font-face`；`Head.astro` preload 400/600。禁止用 `presetWebFonts` 拉全子集。
- **KaTeX**：样式仅在 `RenderPost.astro` 引入，勿写回 `markdown.css` 全站 `@import`。
- **Pagefind**：`SearchSwitch` 默认不急切加载；打开搜索（或 URL `?search=`）再 `__loadPagefind()`。
- **OG 图底图**：`plugins/og-template/markup.ts` 仅有 plum/dot/rose/particle 静态资源；页面 `bgType: glitch`（及 wave/constellation）会映射为 `dot`，避免生成失败。
- **`src/utils/theme.ts`**：`isDarkTheme()` / `accentStrokeColor()`。背景读取主题必须走此工具；禁止只读 `html.dark`。
- **`src/utils/gallery-json.ts`**：photos / gallery JSON endpoint 的公共构建逻辑（`computeGalleryHash` / `buildGalleryData` / `createGalleryResponse`）。注意 `import.meta.glob` 只接受字面量，glob 由各 endpoint 自行声明后传入。本地图路径解析见 **`resolveLocalImagePath`**（`src/utils/resolve-local-image-path.ts`）：按完整后缀 / 唯一 basename 匹配，**禁止** `path.includes(id)` 子串匹配。
- **`src/components/views/PhotoView.astro`**：相册/画廊客户端 CE。`connectedCallback` 为 async：用 `#mountGeneration` + `AbortController` 在 View Transitions 离开后丢弃过期初始化；`.photo-loader` 在父级内查找，勿用全局 `document.querySelector`。
- **`src/utils/sanitize-html.ts`**：远程/不可信 HTML 的 DOMPurify 净化（`sanitizeHtml`）。`CardItem.astro`（Bluesky `html` / `details`）与 `GithubItem.astro`（Release `descriptionHTML` / PR `bodyHTML`）在 `set:html` 前必须调用；带 `target` 的链接会强制 `rel="noopener noreferrer"`。新增同类远程 HTML 渲染点也应复用，禁止直接注入未净化内容。
- **`src/utils/reading-time.ts`**：阅读时间估算（`resolveMinutesRead` / `estimateMinutesReadFromText`）。列表页（`ListView.astro`）用 entry `body` 估算，**禁止**为取 `minutesRead` 对每篇 `await render()`；remark 插件 `plugins/remark-reading-time.ts` 与正文页共用同一公式。
- **`src/utils/markdown-headings.ts`**：从 Markdown `body` 提取标题（`extractMarkdownHeadings`）。Shorts（`getShortsFromBlog`）用此工具取 h2 锚点，**禁止**为取 headings 对每篇 `await render()`。
- **`public/_headers`**：Cloudflare Workers 静态资源安全响应头。CSP 要点：
  - **Pagefind**：`script-src 'wasm-unsafe-eval'` + `worker-src 'self' blob:`
  - **Bunny Fonts / KaTeX**：`font-src` / `style-src` 含 `fonts.bunny.net`、`cdn.jsdelivr.net`
  - **script-src / connect-src**：勿用宽泛 `https:`；第三方白名单含 `https://umami.chawfoo.com`、`analytics.ahrefs.com`、`giscus.app`。更换 Umami 域名时同步改此处与 `PUBLIC_UMAMI_SRC`
  - **img-src / media-src**：可保留 `https:`（正文远程图、COS、Google favicon 等）
  - 文章内 iframe：`frame-src` 含 YouTube / Bilibili / Giscus

## 样式加载

- viewerjs 主样式用 `viewerjs/dist/viewer.css?url` 挂在 `ImageViewer.astro` 模板（仅渲染该组件的页面），不要在 `<script>` 里 `import` CSS（易被抽进全站公共样式），也不要加回 `markdown.css`；`markdown.css` 中仅保留主题对 `.viewer-*` 的覆盖规则。
- KaTeX 样式仅 `RenderPost.astro` 引入；`markdown.css` 禁止 `@import` KaTeX。
- 设计 token、字体、背景色系统与页面分配约定见 [design-system.md](./design-system.md)。
- UnoCSS 图标：`unocss.config.ts` 中 `presetIcons.collections` 从 `@iconify/json` 显式加载。Cursor/VS Code 会设置 `VSCODE_CWD`，导致默认 node-loader 被跳过；新增图标集合时需同步加入 `iconCollections` 列表。

## 图片资产规范

- `src/content/photos/`、`src/content/ai-gallery/` 中的本地原图：**长边 ≤ 2000px、WebP quality 80**（单文件应控制在 1MB 以内）。压缩示例：

```bash
node -e "require('sharp')('in.webp').resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:80}).toFile('out.webp')"
```

- 2026-06 压缩前的原图备份在 `.backup/photos-originals/`（也可从 git 历史恢复）。

## 工程配置

- `lint-staged` 只对 `*.{js,mjs,cjs,ts,mts,astro}` 执行 ESLint。
- Node 要求 `>=22.12.0`（Astro 6 最低版本；已移除 Node 18 / 20）。
- 内容 schema 的 Zod 从 `astro/zod` 引入（Zod 4）；URL 校验见 `src/utils/url-schema.ts`。
- Markdown 插件经 `markdown.processor: unified({ remarkPlugins, rehypePlugins })` 配置（Astro 6 弃用顶层 `remarkPlugins` / `rehypePlugins`）。
- `headingIdCompat` 仍通过 `plugins/index.ts` 中 `[rehypeHeadingIds, { headingIdCompat: true }]` 保留。
- `@ascorbic/feed-loader` v2 默认非 legacy：feeds 条目字段为 `published` / `url`（不再是 `pubdate` / `link`），见 `ListView.astro`。从 v1 升级后若 `/feeds` 空白，删除 `.astro/data-store.json`（或整目录 `.astro/`）再 `pnpm sync` / `pnpm build`，避免 HTTP 304 保留旧字段缓存。
- 预渲染冲突策略：`prerenderConflictBehavior: 'error'`（Astro 6 稳定项，替代已移除的 `experimental.failOnPrerenderConflict`）。
- 本地 Pagefind 索引目录 `public/pagefind/` 已从 `tsconfig` exclude，避免 `astro check` 扫描生成物。
- `wrangler.toml` 为 Cloudflare Workers 生产部署配置（Worker `blog-4`），**不可删除**，详见 [deployment.md](./deployment.md)。
- 单元测试：`pnpm test`（Node 内置 test runner + `--experimental-strip-types`），覆盖 `sanitize-html` / `reading-time` / `markdown-headings` / `httpUrlSchema` / `resolveLocalImagePath`。CI（`.github/workflows/ci.yml`）在 check、lint 之后、build 之前执行 `pnpm test`。
- 英文博客 sitemap：`astro.config.ts` 的 `collectMarkdownContentIds` **保持与 Astro content id 相同的大小写**（勿 `toLowerCase`），避免 Linux 生产环境路径错误。
