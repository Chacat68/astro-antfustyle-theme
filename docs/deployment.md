# 部署与发布流程

生产站点部署在 **Cloudflare Workers**（Worker 名称 `blog-4`），生产域名为 **`https://foo-z.com/`**。  
GitHub 仓库：`Chacat68/astro-antfustyle-theme`，**触发 Cloudflare 自动构建的分支为 `run`**。

## 提交并推送后的验证顺序

每次完成 `git commit` 与 `git push` 后，**必须先查 GitHub，再查 Cloudflare**，确认远程已收到提交且构建/部署成功。

### 1. 查询 GitHub 仓库状态

```bash
# 同步远程并对比本地与 origin/run
git fetch origin run
git status
git rev-parse HEAD origin/run
git log origin/run -1 --oneline
```

可选（需已 `gh auth login`）：

```bash
gh repo view --json name,defaultBranchRef,url,pushedAt
gh run list --branch run --limit 5
```

**通过标准：**

- 工作区干净，或仅剩预期未提交文件
- `HEAD` 与 `origin/run` 的 commit SHA 一致
- 最新 commit message 与本次提交相符

### 2. 查询 Cloudflare Workers 构建状态

通过 Cloudflare MCP（`plugin-cloudflare-cloudflare-builds`）或 Dashboard 查看 Worker **`blog-4`** 的 Builds：

1. `workers_builds_list_builds`（`workerId`: `657e9705280f42dfaad75ce828070630`）
2. 确认最新一条记录的 `commitHash` 前缀与 GitHub 上的 SHA 一致
3. 若 `buildOutcome` 为 `fail`，用 `workers_builds_get_build_logs` 查看日志

**通过标准：**

- `status`: `stopped`，`buildOutcome`: `success`
- `branch`: `run`
- 部署命令：`pnpm run build` → `npx wrangler deploy`

### 3. 线上抽检（可选）

```bash
curl -sI https://foo-z.com/ | head -5
curl -s https://foo-z.com/ | grep -o 'rel="canonical" href="[^"]*"'
```

确认 HTTP 200，且 canonical / sitemap / RSS 使用 `https://foo-z.com/`。

## 本地配置

| 文件 | 说明 |
|------|------|
| `wrangler.toml` | Worker 名 `blog-4`，静态资源目录 `./dist`；`[observability]` 启用日志（`logs.enabled` / `persist` / `invocation_logs`），`traces` 关闭 |
| `public/_headers` | 生产安全响应头（CSP、HSTS、X-Frame-Options 等）+ 缓存策略，随静态资源一并部署。CSP：Pagefind 需 `wasm-unsafe-eval`；Bunny / KaTeX 字体与样式域名；`script-src` 含 `data:`（ClientRouter）；`script-src`/`connect-src` **不使用**宽泛 `https:`，白名单含 `umami.chawfoo.com`、Ahrefs、Giscus（含 `api.github.com`）、Cloudflare Insights。`/_astro/*` 与 `/pagefind/*` 使用一年 `immutable` 长缓存 |
| `src/config.ts` | `SITE.website` 必须为 `https://foo-z.com/` |
| `.env.example` | 统计脚本、GitHub Token 等环境变量说明 |

生产构建（如 Cloudflare Builds）需在构建环境中配置 `PUBLIC_UMAMI_SRC` 与 `PUBLIC_UMAMI_WEBSITE_ID`，且 **`PUBLIC_UMAMI_SRC` 必须与 Umami 后台「Tracking code」里的 `src` 完全一致**（可能是 `/script.js`，也可能是自定义路径如 `/cwf`），否则页面不会加载统计脚本或请求失败。

## 常见问题

### 构建失败：Failed to parse image reference（COS / 远程图）

日志类似：

```text
Failed to parse image reference: {&#x22;inferSize&#x22;:true,&#x22;src&#x22;:&#x22;https://blog-1259751088.cos.ap-shanghai.myqcloud.com/....png?imageSlim&#x22;,...}
Caught error rendering /blog/design7
```

说明：Astro 在 `updateImageReferencesInBody` 里对 JSON 解析失败和 `getImage`/`inferSize` 失败共用同一报错文案。Cloudflare Builds 从境外拉腾讯云上海 COS 时，常见真实原因是远程拉取超时或失败（单页多图时更明显），不一定是 JSON 本身坏了。

处理：

1. **推荐（已落地）**：不要把 `blog-1259751088.cos.ap-shanghai.myqcloud.com` 放进 `SITE.imageDomains`。正文 Markdown 远程图将按原链输出，由 COS/`?imageSlim` 负责优化，构建不再依赖境外拉取。
2. 若必须启用 Astro 远程优化：保证构建环境能稳定访问该 COS，并避免超大图、裸 `.tif`。

### 构建失败：Failed to parse image reference（`.tif`）

日志类似：

```text
Failed to parse image reference: ... "src":".../uPic/xxx.tif" ...
Caught error rendering /blog/diary1
```

原因：正文 Markdown 使用了腾讯云 COS 上的 **TIFF**（体积可达十余 MB）。若 COS 域名在 `SITE.imageDomains` 中，Astro 会在构建期拉取并解析；`.tif` 不被该管线可靠支持，且浏览器也几乎无法直接显示。

处理：在 COS 原链后追加数据万象参数，让浏览器拿到 WebP/JPEG，例如：

```markdown
![alt](https://blog-1259751088.cos.ap-shanghai.myqcloud.com/uPic/xxx.tif?imageMogr2/format/webp)
```

新文请优先上传 `.webp` / `.jpg` / `.png`，避免再写裸 `.tif` 链接。

### 构建失败：YAML frontmatter

日志出现 `bad indentation of a mapping entry` 时，检查对应 Markdown 的 frontmatter：含冒号的 `title` 等字段需用引号包裹。

### GitHub Actions CI 与 Cloudflare Builds

- **CI**（`.github/workflows/ci.yml`）在 `Chacat68/astro-antfustyle-theme` 的 **`main`** 与 **`run`** push/PR 时运行（check + lint + **test** + build）
- **Cloudflare 生产部署** 由 **`run`** 分支 push 触发

CI 通过不等于已上线；以 Cloudflare Builds 结果为准判断生产是否更新。
