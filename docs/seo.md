# SEO 指南

本文档说明站点的搜索引擎优化策略、实现位置与日常维护方式。

## 架构概览

| 层级 | 文件 | 职责 |
|------|------|------|
| 页面元数据 | `src/components/base/Head.astro` | title、description、canonical、Open Graph、Twitter Card、hreflang、JSON-LD |
| 路由策略 | `src/utils/seo.ts`、`src/utils/seo-filters.ts` | noindex 路由表、sitemap 过滤、description 截断 |
| 站点地图 | `astro.config.ts` → `@astrojs/sitemap` | 生成 `sitemap-index.xml`，排除 noindex 与无英文翻译的文章 |
| 爬虫规则 | `astro.config.ts` → `astro-robots-txt` | 生成 `robots.txt`，指向 sitemap |
| AI 内容索引 | `src/pages/llms.txt.ts` | 生成精简的双语文章目录与 Markdown 入口 |
| 文章纯文本 | `src/pages/*/blog/[...slug]/index.html.md.ts` | 为每篇中英文文章生成无脚本、无导航的 Markdown 版本 |
| RSS | `src/pages/rss.xml.js`、`src/pages/en/rss.xml.js` | 中文 / 英文博客订阅源 |
| 审计 | `scripts/seo-audit.mjs` | 构建后检查 HTML 元数据完整性 |

## 关键配置

### 生产域名

`src/config.ts` 中 `SITE.website` 必须为实际部署域名（当前 `https://foo-z.com/`）。该值影响 canonical URL、sitemap、Open Graph 与 JSON-LD。详见 [site-config.md](./site-config.md)。

### noindex 页面

以下路由不对搜索引擎开放索引（`robots: noindex, follow`，且不出现在 sitemap）：

- `/404/`、`/feeds/`、`/streams/`、`/highlights/`、`/shorts/`
- `/prs/`、`/releases/`（主题 Loader 示例页）
- 英文 fallback 路由（如无对应 `blog_en` 文章的 `/en/blog/*`）
- 仅中文内容的 `/en/changelog/` 与 `/en/changelog/*`（由 `isEnglishChangelogFallback()` 过滤）

在页面层通过 `BaseLayout` 的 `noindex` prop 设置；在 sitemap 层通过 `src/utils/seo.ts` 的 `NOINDEX_ROUTE_PATHS`、`isEnglishChangelogFallback()` 与 `shouldIncludeInSitemap()` 统一过滤。`customPages` 只加入可索引英文静态路由，勿把 noindex 页（如 `/en/shorts/`）写进去。

### 多语言 SEO

- 默认语言（zh）在根路径（如 `/blog/`），英文在 `/en/` 前缀下。
- 每页输出 `link rel="canonical"` 与 `hreflang` 交替链接，`x-default` 指向中文版。
- 博客文章：有 `blog_en` 翻译时，**中英文页都**输出双语 hreflang（`availableLocales` 在中文路由也会查英文翻译是否存在）；无翻译的英文路由 canonical 回中文并标记 noindex。
- Changelog 仅中文：英文路由 rewrite 展示中文内容，`availableLocales=['zh']`、canonical 指向中文、noindex，且不进 sitemap。

### 结构化数据

`Head.astro` 输出 Schema.org JSON-LD `@graph`，包含：

- `Person`（作者）
- `WebSite`（站点）
- `ImageObject`（OG 图）
- `WebPage` 或 `BlogPosting`（按是否有 `pubDate` 区分）
- `BreadcrumbList`（非首页）

### AI 抓取入口

- `/llms.txt` 按 llms.txt 提案格式提供站点简介、主要页面和全部已发布中英文文章的 Markdown 链接。它是辅助发现入口，不替代 `robots.txt` 或 sitemap。
- 每篇文章在 canonical HTML 路径下提供 `index.html.md`，例如 `/blog/ai1/index.html.md`；英文文章对应 `/en/blog/ai1/index.html.md`。
- 文章 HTML 通过 `<link rel="alternate" type="text/markdown">` 声明对应的纯文本版本。
- `robots.txt` 明确允许 OpenAI、Anthropic 与 Google 的已知 AI crawler token，同时保留 `User-agent: *` 的开放策略。
- `llms.txt` 与 Markdown alternate 不进入 XML sitemap，避免把非 canonical 表示当作独立页面提交。

`llms.txt` 仍是社区提案，并非所有 AI 服务都承诺读取；抓取控制仍以各厂商声明支持的 `robots.txt` user-agent 为准。

### Meta 长度控制

- **Title**：`formatPageTitle()` 将浏览器标题控制在 60 字符内（保留 ` - 站点名` 后缀，截断过长的文章标题）。页面内 `<h1>` 仍显示完整标题。
- **Description**：`truncateMetaDescription()` 在输出前将 description 截断至 160 字符。文章 frontmatter 仍可写完整句子，HTML meta 会自动处理。

## 页面文案规范

公开页面的 title / description 统一由 `src/i18n/ui.ts` 的 `page.*` 键提供，页面文件只保留行为配置（`bgType` / `toc` / `ogImage` / `noindex`）。参见 [architecture-conventions.md](./architecture-conventions.md)。

博客与 changelog 文章的 `description` 写在各 Markdown frontmatter 中。

## 日常维护

### 批量修正博客 description

```bash
node scripts/fix-blog-descriptions.mjs
```

脚本将 frontmatter 中的 `description` 调整到 50–160 字符：偏长则智能截断，偏短则优先取 `subtitle` 或正文首段补充。运行后建议重新构建并审计。

### 运行 SEO 审计

```bash
pnpm build
pnpm seo:audit
```

审计脚本检查：

- 每个 HTML 页是否包含 title、description、canonical、og:*、JSON-LD
- canonical 是否使用 `https://foo-z.com` 域名
- `robots.txt` 与 sitemap 是否存在
- `llms.txt`、中英文文章 Markdown 与 HTML alternate link 是否完整对应
- 主要 AI crawler token 是否在 `robots.txt` 中明确允许
- sitemap 是否错误包含 `llms.txt`、Markdown alternate 或 `/en/changelog`
- 有英文翻译的中文博客页是否输出 `hreflang="en"`
- 可索引页面的重复 title / description
- title / description 长度是否超出建议范围

警告不阻塞 CI；错误（缺少必要元数据等）会以退出码 1 失败。

### 新增页面 checklist

1. 在 `src/i18n/ui.ts` 添加 `page.<name>.title` 与 `page.<name>.description`
2. 页面通过 `BaseLayout` 传入 title / description
3. 若为示例页或不应被索引，设置 `noindex={true}` 并将路径加入 `NOINDEX_ROUTE_PATHS`
4. 运行 `pnpm seo:audit` 确认无错误

### 新增博客文章 checklist

1. frontmatter 填写 `title`、`description`（50–160 字符为佳）、`pubDate`
2. 可选：设置 `ogImage` 或在 `public/og-images/` 放置对应 PNG
3. 若有英文版，在 `src/content/blog/en/` 添加同名 slug 文件

## Open Graph 图片

构建时由 `remark-generate-og-image` 插件按页面生成 OG 图， fallback 为 `public/og-images/og-image.png`。可在文章 frontmatter 设置 `ogImage: 'custom.png'`（文件需存在于 `public/og-images/`）。
