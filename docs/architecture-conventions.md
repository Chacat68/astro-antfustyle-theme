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
- **`src/components/backgrounds/p5-background.ts`**：p5 背景的公共自定义元素工厂 `defineP5Background(tagName, sketch)`，统一处理 p5 动态加载、`requestIdleCallback` 延迟初始化与生命周期销毁。新增 p5 背景只需写 sketch 函数。Plum / Rose 为原生 canvas 实现，不走此工厂。
- **`src/components/backgrounds/Wave.astro`**：首页默认背景，使用纯 SVG + CSS 动画（无 p5 依赖），避免首屏加载约 1MB 的 `p5.min.js` 及全屏 canvas 成为 LCP 元素。Dot / Particle / Constellation 仍走 p5 工厂。
- **首屏 LCP**：首页 intro 段落使用 `slide-enter-instant` 跳过 `slide-enter-content` 的 opacity 阶梯动画，确保标题与首段文字尽早计入 LCP。
- **`src/utils/gallery-json.ts`**：photos / gallery JSON endpoint 的公共构建逻辑（`computeGalleryHash` / `buildGalleryData` / `createGalleryResponse`）。注意 `import.meta.glob` 只接受字面量，glob 由各 endpoint 自行声明后传入。
- **`src/utils/sanitize-html.ts`**：远程/不可信 HTML 的 DOMPurify 净化（`sanitizeHtml`）。`CardItem.astro`（Bluesky `html` / `details`）与 `GithubItem.astro`（Release `descriptionHTML` / PR `bodyHTML`）在 `set:html` 前必须调用；新增同类远程 HTML 渲染点也应复用，禁止直接注入未净化内容。
- **`src/utils/reading-time.ts`**：阅读时间估算（`resolveMinutesRead` / `estimateMinutesReadFromText`）。列表页（`ListView.astro`）用 entry `body` 估算，**禁止**为取 `minutesRead` 对每篇 `await render()`；remark 插件 `plugins/remark-reading-time.ts` 与正文页共用同一公式。
- **`src/utils/markdown-headings.ts`**：从 Markdown `body` 提取标题（`extractMarkdownHeadings`）。Shorts（`getShortsFromBlog`）用此工具取 h2 锚点，**禁止**为取 headings 对每篇 `await render()`。
- **`public/_headers`**：Cloudflare Workers 静态资源安全响应头；改 CSP 时需兼顾 Umami/Ahrefs/Giscus 与文章内 YouTube/Bilibili iframe。

## 样式加载

- viewerjs 的主样式在 `ImageViewer.astro` 的 script 中按需引入（`import 'viewerjs/dist/viewer.css'`），不要加回 `markdown.css` 全站加载；`markdown.css` 中仅保留主题对 `.viewer-*` 的覆盖规则。

## 图片资产规范

- `src/content/photos/`、`src/content/ai-gallery/` 中的本地原图：**长边 ≤ 2000px、WebP quality 80**（单文件应控制在 1MB 以内）。压缩示例：

```bash
node -e "require('sharp')('in.webp').resize({width:2000,height:2000,fit:'inside',withoutEnlargement:true}).webp({quality:80}).toFile('out.webp')"
```

- 2026-06 压缩前的原图备份在 `.backup/photos-originals/`（也可从 git 历史恢复）。

## 工程配置

- `lint-staged` 只对 `*.{js,mjs,cjs,ts,mts,astro}` 执行 ESLint。
- Node 要求 `>=20.9.0`（已移除 EOL 的 Node 18）。
- `wrangler.toml` 为 Cloudflare Workers 生产部署配置（Worker `blog-4`），**不可删除**，详见 [deployment.md](./deployment.md)。
- 单元测试：`pnpm test`（Node 内置 test runner + `--experimental-strip-types`），覆盖 `sanitize-html` / `reading-time` / `markdown-headings` / `httpUrlSchema`。
