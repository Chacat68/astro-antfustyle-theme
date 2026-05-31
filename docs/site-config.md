# 站点配置说明

## 生产域名

在 `src/config.ts` 中，`SITE.website` 必须设置为实际部署的 canonical 域名：

```ts
export const SITE = {
  website: 'https://foo-z.com/',
  // ...
}
```

该值会影响 sitemap、RSS、Open Graph、JSON-LD 结构化数据与 canonical URL。请勿继续使用上游主题的 demo 域名。

## 站内链接规范

从旧 Notion / NotionNext 站点（`/article/<slug>`）迁移后，文章互链应使用 Astro 路由：

| 旧路径 | 新路径 |
|--------|--------|
| `https://www.chawfoo.com/article/ai3` | `/blog/ai3/` |
| `https://www.chawfoo.com/article/diary9` | `/blog/diary9/` |
| `https://www.chawfoo.com/look` | 改为文内锚点或删除（该页面已不存在） |

项目页中指向本站项目列表的条目，使用完整 URL `https://foo-z.com/projects/`（schema 要求 `link` 为合法 URL，不可用相对路径）。

独立子站（如 `https://arch.chawfoo.com/`）可继续保留完整 URL。

## CI（GitHub Actions）

`.github/workflows/ci.yml` 已配置为在 `Chacat68/astro-antfustyle-theme` 仓库的 `main` 分支 push / PR 时运行：

- `pnpm check`
- `pnpm lint`
- `pnpm build`

若需拉取 GitHub Releases / PRs 等远程内容，在仓库 Settings → Secrets 中添加 `GH_TOKEN_FOR_LOADER`（GitHub Personal Access Token）。未配置时构建仍会完成，远程 Loader 会保留上次缓存数据。
