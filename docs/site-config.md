# 站点配置说明

## 生产域名

在 `src/config.ts` 中，`SITE.website` 必须设置为实际部署的 canonical 域名：

```ts
export const SITE = {
  website: 'https://foo-z.com/',
  // ...
}
```

该值会影响 sitemap、RSS、Open Graph、JSON-LD 结构化数据与 canonical URL。请勿继续使用上游主题的 demo 域名。完整 SEO 策略与维护流程见 [seo.md](./seo.md)。

## 站内搜索（Pagefind）

- 依赖：`pagefind` ≥ 1.5（中文查询分词）。
- 构建：`postbuild` 执行 `pagefind --site dist --force-language zh-cn ...`，全站统一为 `zh-cn` 索引。
- 运行时：`SearchSwitch.astro` 中 `pagefind.init('zh-cn')`。
- 本地验证：先 `pnpm build`（同步索引到 `public/pagefind/`），再 `pnpm dev`；或 `pnpm preview`。
- 召回：正文注入标题/标签与 CJK 分词增强；`noindex` 页不入库；查询仅在主结果不足时做中文变体补漏。

## 导航栏

`UI.navBarLayout` 控制顶栏左右组件序列。当前未放入 `socialLinks`：社交媒体图标不在导航栏（含移动端面板）显示，首页展示台左下角与 About「找到我」区块仍使用 `UI.socialLinks`。若要恢复到顶栏，在 `right`（或 `left`）数组中加入 `'socialLinks'` 即可。

## 站内链接规范

从旧 Notion / NotionNext 站点（`/article/<slug>`）迁移后，文章互链应使用 Astro 路由：

| 旧路径 | 新路径 |
|--------|--------|
| `https://www.chawfoo.com/article/ai3` | `/blog/ai3/` |
| `https://www.chawfoo.com/article/diary9` | `/blog/diary9/` |
| `https://www.chawfoo.com/look` | 改为文内锚点或删除（该页面已不存在） |

项目页数据来源为 `src/content/projects/data.json`（中英双语字段约定见 [architecture-conventions.md](./architecture-conventions.md)）。指向本站项目列表的条目，使用完整 URL `https://foo-z.com/projects/`（schema 要求 `link` 为合法 URL，不可用相对路径）。

GitHub / 独立子站项目（如 `https://github.com/Chacat68/linegame-web`、`https://arch.chawfoo.com/`）使用对应完整 URL。

## AI 绘图画廊（`/gallery`）

AI 生成图、概念稿等集中在 **`/gallery`**，数据文件为 **`src/content/ai-gallery/data.json`**，本地素材放在 **`src/content/ai-gallery/images/`**（或该目录下任意子路径）。每条目为 `{ "id": "…", "desc": "…", "tags": ["…"] }`：`id` 为相对路径（如 `images/foo.webp`）或可访问的 `https://` 图片地址；`desc` 为可选说明；`tags` 为可选标签数组，用于页面筛选，省略则仅在「全部」中显示。同一作品可属于多个标签。

画廊页在配置 `tags` 时支持 **顶部标签** 与 **图片角标** 点击筛选，并通过 **`?tag=标签名`** 与地址栏同步（详见 [src/content/ai-gallery/README.md](../src/content/ai-gallery/README.md)）。

## CI（GitHub Actions）

`.github/workflows/ci.yml` 在 `Chacat68/astro-antfustyle-theme` 的 **`main`** 与生产分支 **`run`** 的 push / PR 时运行：

- `pnpm check`
- `pnpm lint`
- `pnpm build`

若需拉取 GitHub Releases / PRs 等远程内容，在仓库 Settings → Secrets 中添加 `GH_TOKEN_FOR_LOADER`（GitHub Personal Access Token）。未配置时构建仍会完成，远程 Loader 会保留上次缓存数据。

## 评论（Giscus）

`FEATURES.giscus` 当前为关闭。若要启用，须到 [giscus.app](https://giscus.app) 用本仓库 `Chacat68/astro-antfustyle-theme` 重新生成 `data-repo-id` / `data-category-id` 填入 `src/config.ts`，勿复用上游主题仓库的 ID。

## 部署与发布

Cloudflare Workers 生产部署绑定 **`run`** 分支。提交并推送后，应先核对 GitHub 远程 commit，再核对 Cloudflare Worker `blog-4` 构建结果。完整步骤见 [deployment.md](./deployment.md)。
