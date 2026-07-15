# Fuwari URL 迁移规则

## 目标

将旧站 `https://www.chawfoo.com/` 的外链、搜索引擎索引和用户书签永久迁移到 canonical 域名 `https://foo-z.com/`，并将 Fuwari 的路径结构映射到当前 Astro 项目。

迁移使用两层规则：

1. Cloudflare Bulk Redirects 负责域名迁移，并原样保留路径与查询参数。
2. Worker 静态资源目录中的 `public/_redirects` 负责旧路径到新路径的转换。

这样 `/projects/`、`/friends/`、`/rss.xml` 等未改名路径也会迁移域名，而 `/posts/<slug>/`、`/archive/` 等改名路径会继续转换到新路由。

## 路由分析

| Fuwari 路由 | 当前项目路由 | 策略 |
| --- | --- | --- |
| `/` | `/` | 保留首页路径 |
| `/posts/<slug>/` | `/blog/<slug>/` | 按 slug 永久重定向 |
| `/article/<slug>` | `/blog/<slug>/` | 兼容更早的 Notion / NotionNext 外链 |
| `/archive/` | `/blog/` | 新站博客页承担文章总览 |
| `/archive/?tag=...` | `/blog/` | 新站没有等价的标签筛选 URL，降级到文章总览 |
| `/archive/?category=...` | `/blog/` | 新站没有等价的分类筛选 URL，降级到文章总览 |
| `/2/` 至 `/15/` | `/blog/` | 新站不分页，统一到文章总览 |
| `/page/<number>/` | `/blog/` | 兼容旧分页格式 |
| `/about/` | `/about/` | 个人介绍与社交链接在独立关于页；首页为故障艺术展示台入口 |
| `/moments/my-moments/` | `/shorts/` | 两者都是短内容/日常随笔入口 |
| `/projects/` | `/projects/` | 只迁移域名，路径不变 |
| `/friends/` | `/friends/` | 只迁移域名，路径不变 |
| `/rss.xml` | `/rss.xml` | 只迁移域名，路径不变 |

内容文件对比结果：旧站有 124 篇文章，其中 123 个 slug 在新站有同名目标；`2025-year-end-summary` 是唯一缺失项，因此明确降级到 `/blog/`，避免通配规则把它送到 404。旧站已存在的错误 slug `hk18-kiri-t-outrageous-thing-cover` 继续转到 `hk19-kiri-t-outrageous-thing-cover`。

## 启用域名迁移

在 Cloudflare Dashboard 创建 Bulk Redirect List，导入：

`deploy/cloudflare-bulk-redirects.csv`

CSV 中两条规则分别覆盖裸域名与 `www`：

- `301`：永久重定向。
- `preserve_query_string=true`：保留查询参数。
- `include_subdomains=false`：不影响 `arch.chawfoo.com` 等独立子站。
- `subpath_matching=true`：匹配旧域名下所有路径。
- `preserve_path_suffix=true`：将完整路径带到 `foo-z.com`。

导入列表后，还必须在 Cloudflare 中创建并启用引用该列表的 Bulk Redirect Rule。仅上传 CSV 不会开始重定向。

## 发布与验证

项目构建后应确认规则文件已复制到产物：

```bash
pnpm build
test -f dist/_redirects
```

Worker 部署完成且 Bulk Redirect Rule 启用后，抽查完整跳转链：

```bash
curl -IL https://www.chawfoo.com/posts/ai3/
curl -IL https://www.chawfoo.com/archive/?tag=AI
curl -IL https://www.chawfoo.com/projects/
curl -IL https://www.chawfoo.com/posts/2025-year-end-summary/
```

预期最终地址分别为：

- `https://foo-z.com/blog/ai3/`
- `https://foo-z.com/blog/`
- `https://foo-z.com/projects/`
- `https://foo-z.com/blog/`

确认迁移稳定后，在 Google Search Console 和其他站长平台提交新站 sitemap：`https://foo-z.com/sitemap-index.xml`。旧域名的重定向建议长期保留，不要在搜索引擎完成迁移后立即撤销。
