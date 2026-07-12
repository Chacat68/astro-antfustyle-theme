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
| `wrangler.toml` | Worker 名 `blog-4`，静态资源目录 `./dist` |
| `public/_headers` | 生产安全响应头（CSP、HSTS、X-Frame-Options 等），随静态资源一并部署；CSP 须含 Pagefind 的 `wasm-unsafe-eval` 与 Bunny Fonts 的 `fonts.bunny.net` |
| `src/config.ts` | `SITE.website` 必须为 `https://foo-z.com/` |
| `.env.example` | 统计脚本、GitHub Token 等环境变量说明 |

生产构建（如 Cloudflare Builds）需在构建环境中配置 `PUBLIC_UMAMI_SRC` 与 `PUBLIC_UMAMI_WEBSITE_ID`，且 **`PUBLIC_UMAMI_SRC` 必须与 Umami 后台「Tracking code」里的 `src` 完全一致**（可能是 `/script.js`，也可能是自定义路径如 `/cwf`），否则页面不会加载统计脚本或请求失败。

## 常见问题

### 构建失败：YAML frontmatter

日志出现 `bad indentation of a mapping entry` 时，检查对应 Markdown 的 frontmatter：含冒号的 `title` 等字段需用引号包裹。

### GitHub Actions CI 与 Cloudflare Builds

- **CI**（`.github/workflows/ci.yml`）仅在 `Chacat68/astro-antfustyle-theme` 的 **`main`** push/PR 时运行
- **Cloudflare 生产部署** 由 **`run`** 分支 push 触发

两者互不影响；以 Cloudflare Builds 结果为准判断生产是否更新。
