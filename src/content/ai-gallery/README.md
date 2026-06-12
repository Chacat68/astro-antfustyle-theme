# AI 绘图画廊数据说明

对应站点路由 **`/gallery`**（导航「AI 创作」）。条目列表写在同目录下的 **`data.json`**。

## 添加一条作品

`data.json` 是一个 JSON 数组，每个元素包含：

| 字段 | 说明 |
|------|------|
| `id` | **必填**。本地图片的相对路径（见下）或完整的 `http(s)://` 图片 URL。 |
| `desc` | **可选**。说明文字，例如提示词摘要、模型名、创作日期。 |
| `kind` | **可选**。作品类型，供 `/gallery` 页筛选：`character`（角色）、`scene`（场景）。不写则仅在「全部」下列出，不会出现在「角色」或「场景」筛选结果中。 |

### 方式一：本地文件（推荐入库）

1. 将图片放到 **`images/`** 下（任意子目录亦可，只要在 `ai-gallery` 树内）。
2. 支持的扩展名：**`.jpg` `.jpeg` `.png` `.webp` `.avif`**。
3. 在 `data.json` 里写 `id` 为能唯一匹配到该文件的路径片段，例如文件为  
   `src/content/ai-gallery/images/2026/foo.webp`  
   则 `id` 可写 **`images/2026/foo.webp`**（需与构建时的 glob 路径匹配，通常用 `images/...` 即可）。

### 方式二：远程 URL

与相册 `/photos` 相同，可直接写图床链接，例如：

```json
{
  "id": "https://example.com/your-ai-art.webp",
  "desc": "Flux · 2026-01"
}
```

## 示例 `data.json`

把下面复制进 `data.json` 后，将 `id` 换成你的真实文件名或 URL：

```json
[
  {
    "id": "images/example-01.webp",
    "desc": "城市夜景概念 · Midjourney",
    "kind": "scene"
  },
  {
    "id": "https://你的图床/作品.png",
    "desc": "角色设计草图 · SDXL",
    "kind": "character"
  }
]
```

## 页面筛选与地址栏

`/gallery` 开启类型筛选时：

- 顶部 **全部 / 角色 / 场景** 与每张图右上角的 **类型角标** 均可点击，效果相同。
- 地址栏使用查询参数 **`?kind=character`** 或 **`?kind=scene`**（选「全部」时不带参数）。复制带参数的链接打开即可直达对应筛选。
- 若 `?kind=` 取值非法，会自动回到「全部」并从地址栏去掉该参数。


为兼顾加载速度与清晰度，本地原图建议：**长边 ≤ 2000px、WebP 质量约 80、单文件尽量小于 1MB**（与 `docs/architecture-conventions.md` 中相册约定一致）。

## 构建注意

- 若 `id` 指向的本地文件不存在，构建日志会提示跳过该条，页面上不会显示。
- 修改 `data.json` 或增删图片后重新执行 `pnpm build`（或开发服务器会自动刷新）。
