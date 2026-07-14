# 科幻 HUD 视觉改造方案（A：克制型）

> 状态：已落地（A：克制 HUD + 青蓝霓虹）  
> 方向：**克制 HUD + 青蓝霓虹**  
> 原则：扩展现有 `AboutScreen` / `LogoButton` 语言，不推翻 antfu 正文优先哲学

## 1. 目标与边界

### 目标

把当前「70% 极简 antfu + 30% 科幻 HUD」统一为全站视觉系统：深空冷调底色、青蓝 accent、共享 HUD 角标/扫描线 primitives；外壳偏科幻，内容核仍是可读的个人博客。

### 不做

- 落地页式 Hero、全屏霓虹渐变、卡片墙
- 高饱和 glow 铺满正文区（装饰 opacity ≤ 15%）
- 首页引入 p5 重背景（LCP 红线）
- 为中文单独引入大体积 Web 字体
- 推翻列表式博客归档（继续 antfu 时间线列表）

### 品牌叙事

冷静科技壳 + 人文内容核。站名「付之一笑」保留字标；HUD 文案延续 `SYS://PROFILE` / `ONLINE` 等终端语气，不升级成游戏 UI。

---

## 2. 视觉方向

| 维度 | 现状 | A 方案目标 |
|------|------|------------|
| 气质 | 极简 + 局部 HUD | 全站轻 HUD，正文区克制 |
| Accent | 天空蓝 `#0284c7` / `#38bdf8` | 青蓝霓虹，仍走 soft/muted 衍生 |
| 底色 | 暖白 / 近黑 | 冷白微青 tint / 深空蓝黑 |
| 圆角 | 0.5rem 系 | 略收锐：0.25–0.5rem，HUD 框用直角+角标 |
| 字体 | IBM Plex + DM Mono | 正文不变；UI 标签/状态栏强化 mono |
| 动效 | 轻位移 + 扫描线 | 保留；新增极轻脉冲 LED，无 glitch 轰炸 |

参考锚点（直接复用语法，不另发明一套）：

- [`AboutScreen.astro`](../src/components/widgets/AboutScreen.astro) — 四角括号、扫描线、LED、mono 状态栏
- [`LogoButton.astro`](../src/components/widgets/LogoButton.astro) — HUD 角标 + 呼吸光斑

---

## 3. Token 方案

在 [`src/styles/main.css`](../src/styles/main.css) 扩展，不散落硬编码。

### 3.1 色彩（定稿值）

**浅色（冷白 + 青蓝）**

| Token | 值 | 说明 |
|-------|-----|------|
| `--c-bg` | `#f4f7f9` | 冷白，去暖黄纸感 |
| `--c-text` | `#0a1218` | 略偏青的近黑 |
| `--c-muted` | `rgba(10, 30, 45, 0.52)` | |
| `--c-surface` | `rgba(255, 255, 255, 0.82)` | |
| `--c-surface-hover` | `rgba(0, 140, 180, 0.06)` | soft 青染 |
| `--c-border` | `rgba(10, 40, 60, 0.12)` | |
| `--c-accent` | `#0891b2` | 青蓝（cyan-600 附近） |
| `--c-accent-soft` | `rgba(8, 145, 178, 0.12)` | |
| `--c-accent-muted` | `rgba(8, 145, 178, 0.55)` | |
| `--c-page-tint` | `rgba(8, 145, 178, 0.05)` | |

**深色（深空 + 霓虹青）**

| Token | 值 | 说明 |
|-------|-----|------|
| `--c-bg` | `#06080c` | 深空蓝黑 |
| `--c-text` | `#e8f1f5` | |
| `--c-muted` | `rgba(200, 230, 240, 0.55)` | |
| `--c-surface` | `rgba(12, 18, 28, 0.78)` | |
| `--c-surface-hover` | `rgba(0, 212, 255, 0.08)` | |
| `--c-border` | `rgba(120, 200, 230, 0.14)` | |
| `--c-accent` | `#22d3ee` | 霓虹青（cyan-400） |
| `--c-accent-soft` | `rgba(34, 211, 238, 0.14)` | |
| `--c-accent-muted` | `rgba(34, 211, 238, 0.6)` | |
| `--c-page-tint` | `rgba(34, 211, 238, 0.06)` | |

**新增 HUD Token**

| Token | 浅色 | 深色 | 用途 |
|-------|------|------|------|
| `--c-hud-line` | `rgba(8, 145, 178, 0.45)` | `rgba(34, 211, 238, 0.5)` | 角标线、面板描边 |
| `--c-hud-grid` | `rgba(8, 145, 178, 0.06)` | `rgba(34, 211, 238, 0.07)` | 网格底（opacity 已内含） |
| `--c-glow` | `rgba(8, 145, 178, 0.25)` | `rgba(34, 211, 238, 0.35)` | 仅 Logo / LED / 焦点，正文禁用 |

### 3.2 形状与阴影

| Token | 新值 | 说明 |
|-------|------|------|
| `--c-radius-sm` | `0.25rem` | 标签、芯片 |
| `--c-radius` | `0.375rem` | 默认 |
| `--c-radius-lg` | `0.5rem` | 大面板；HUD 框本身用 0 + 角标 |
| `--c-shadow` | 略加深冷色阴影 | 避免暖灰影 |

### 3.3 字体策略

- **正文 / UI 主体**：保留 IBM Plex Sans（可读性优先）
- **mono**：保留 DM Mono；扩大用途到 PostMeta、Categorizer 前缀、搜索结果、Footer 状态行
- **不引入** Orbitron 等展示字体（A 方案克制；中文站也不匹配）

### 3.4 同步项

- [`app.webmanifest.js`](../src/pages/app.webmanifest.js) / [`Head.astro`](../src/components/base/Head.astro) 的 `theme_color` → 新 `--c-bg`
- [`ec.config.mjs`](../ec.config.mjs) 代码块背景贴近新 `--c-bg`，主题仍可 Vitesse（或微调 cyan 注释色）
- UnoCSS shortcuts 中 `#888*` 硬编码逐步改走 token

---

## 4. HUD Primitives（共享组件层）

从 `AboutScreen` / `LogoButton` 抽取，避免复制粘贴角标 CSS。

建议路径：`src/styles/hud.css`（或 `src/components/hud/` 小组件）+ 在 `BaseLayout` 引入。

| Primitive | 类名 | 行为 |
|-----------|------|------|
| 四角括号 | `.hud-corners` + 四角伪元素/子元素 | 1px accent 角标，inset 可配 |
| 扫描线 | `.hud-scanlines` | 极淡重复线性渐变；`prefers-reduced-motion` 停动画 |
| 状态点 | `.hud-led` | 小圆点 + 可选 blink |
| 面板框 | `.hud-frame` | surface + border + 可选 corners |
| 标签 | `.hud-label` | `font-mono` uppercase / tracking-wider，muted |
| 状态栏 | `.hud-status` | mono 一行：`ONLINE · LOC …` |

**使用范围（有 / 无）**

| 表面 | 用 HUD？ | 说明 |
|------|----------|------|
| AboutScreen、Logo、Nav 底线、LatestPosts、Search 面板、GroupItem hover | 是 | 壳层 |
| 博客列表行、文章 `.prose`、相册大图 | 否或极轻 | 保阅读 |
| Footer | 轻 | 一行 mono `// EOF` 级 |

---

## 5. 页面与背景重映射

调度器仍为 [`Background.astro`](../src/components/backgrounds/Background.astro)。

| 页面 | 现 `bgType` | 新 `bgType` | 说明 |
|------|-------------|-------------|------|
| 首页 `/` | `wave` | `wave`（改色） | 保留 SVG，波色改青蓝；继续避免 p5 |
| 博客 / 项目 / 友链 | `dot` | `dot`（改色） | accent 跟新 token |
| 文章 / changelog 正文 | `rose` | `false` 或轻量 `grid` | 花瓣与科幻冲突；正文零干扰优先 |
| releases / prs | `plum` | `dot` 或 `constellation` | 梅花偏文艺，换成点阵/星网 |
| shorts | `particle` | `particle`（改色） | |
| 相册 / 画廊 | `false` | `false` | 内容优先 |

可选新增 `bgType: grid`：纯 CSS 网格 overlay（`--c-hud-grid`），零 JS，适合列表页备选。`constellation` 不作为首页默认（p5 成本）。

背景色相统一走 `accentStrokeColor()` / CSS `var(--c-accent)`，避免组件内写死天空蓝。

---

## 6. 组件改造清单（按阶段）

### Phase 1 — Token 换肤（全站立刻可见）

1. `main.css`：写入 §3 Token + 可选 `hud.css`
2. `unocss.config.ts`：清理硬编码灰；加 shortcuts `hud-label` 等
3. `app.webmanifest.js` / `Head.astro`：theme_color
4. 更新本文档状态 + [`design-system.md`](./design-system.md) 方向句

验收：明暗切换正常；链接/选中/NProgress 均为青蓝；无大面积可读性回退。

### Phase 2 — 壳层 HUD 统一

1. 抽取 primitives；`AboutScreen` / `LogoButton` 改为消费 primitives
2. `NavBar`：底部分割线用 `--c-hud-line`；active 链接触发细 neon underline
3. `LatestPosts`：`.hud-frame` + mono 日期 / category
4. `SearchSwitch`：面板加角标；输入框前 `>` prompt（克制，非全终端主题）
5. `Footer`：mono 轻状态行

验收：首页 → 列表 → 搜索视觉同属一套语法。

### Phase 3 — 背景与列表

1. 文章页去掉 `rose`，改为 `false`（或 CSS `grid`）
2. Wave / Dot / Particle / Plum 改色对齐 accent
3. `ListItem` / `Categorizer` / `PostMeta`：mono 时间戳与分类前缀（如 `2024` / `SECTOR`），不做大水印霓虹
4. `GroupItem`：hover 用 accent-soft + 细角标

验收：文章阅读区安静；列表仍是时间线而非卡片墙。

### Phase 4 — 收尾

1. OG 模板字体/色条对齐品牌青蓝
2. Toc / ToTop 细调（侧栏细轨、按钮略锐）
3. `ec.config.mjs` 背景与注释色微调
4. 全站 `prefers-reduced-motion` 回归

---

## 7. 动效规范（A 方案）

| 允许 | 禁止 |
|------|------|
| 扫描线缓慢漂移（已有） | 全屏 glitch / RGB 分离 |
| LED blink（低频） | 持续强 glow 动画 |
| hover `translateX(3px)` + accent-soft | 卡片弹跳、霓虹描边呼吸铺满 |
| Logo 呼吸（opacity，非 text-shadow） | 首页 p5 粒子场 |
| View Transition 圆形主题切换 | 新增长时长入场遮罩 |

时长继续 `--duration` / `--duration-fast`；曲线 `--ease-out`。

---

## 8. 性能与无障碍红线

1. 首页：`slide-enter-instant` + SVG Wave，禁止默认挂 p5
2. 新装饰优先 CSS/SVG；p5 仅内页可选背景
3. 全局尊重 `prefers-reduced-motion`
4. 对比度：正文与 `--c-bg` 保持 WCAG AA；accent 仅用于交互与装饰，不作大段正文色
5. 扫描线/网格不得降低正文对比（叠在背景层 `z-index` 负或极淡）

---

## 9. 文档同步

实施时同步更新：

- [`docs/design-system.md`](./design-system.md) — 方向句改为「极简 antfu + 青蓝 HUD」；Token 表加入 HUD 变量；背景分配表按 §5
- 本文档 — Phase 完成后把状态改为「已落地」

---

## 10. 成功标准

1. 去掉导航后，首屏仍能看出「付之一笑 + HUD 壳」，而非通用蓝白博客
2. 长文页打开感觉安静，不觉得「游戏官网」
3. AboutScreen、Logo、Nav、LatestPosts、Search 五处共用同一套角标/线宽/色相
4. 明暗主题与 theme_color 一致；reduced-motion 下无持续动画
5. Lighthouse LCP 不因背景改造明显劣化（首页仍无 p5）
