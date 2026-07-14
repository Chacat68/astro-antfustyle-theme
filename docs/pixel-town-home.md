# 首页像素模拟都市

主页主视觉为「像素现代都市」，替代乡村小镇与原 `wave` 背景。实现以本文为准。

## 目标

- 一屏构成：品牌「付之一笑」→ 都市标题 → 一句说明 → CTA → 城市画布
- 楼宇可逛：站内栏目 + Changelog + 社交外链 + RSS
- 轻量：纯 Canvas 2D，不引入 p5
- 气质：现代都市天际线、玻璃幕墙、马路车流；浅/深色日夜切换

## 建筑与跳转

| 建筑 | 跳转 |
|------|------|
| 媒体楼 | `/blog` |
| 科技塔 | `/projects` |
| 影像馆 | `/photos` |
| 美术馆 | `/gallery` |
| 街角咖啡 | `/friends` |
| 新闻中心 | `/changelog` |
| GitHub 塔 | 外链 GitHub |
| X 塔 | 外链 X |
| Bluesky 楼 | 外链 Bluesky |
| NeoDB 馆 | 外链 NeoDB |
| RSS 亭 | `/rss.xml`（英文 `/en/rss.xml`） |

社交与 RSS URL 取自 `src/config.ts` 的 `UI.socialLinks` 与 `withBasePath`。

## 技术结构

| 文件 | 职责 |
|------|------|
| `src/pages/index.astro` | 首页编排：`bgType: false` + hero + `PixelTown` |
| `src/components/home/PixelTown.astro` | 384×216 画布、都市绘制、热点 |
| `src/styles/page.css`（`.home-sim*`） | 品牌层级与 CTA |
| `src/i18n/ui.ts`（`home.town.*`） | 中英文案 |

## 视觉规范

- 逻辑分辨率 **384×216**，`image-rendering: pixelated`
- 远景剪影天际线 + 近景可点楼宇 + 人行道/车行道分层
- 模拟：云、行人、车流、信号灯、夜景窗灯/路灯
- `prefers-reduced-motion: reduce` 时静止首帧
- 外链建筑 `target=_blank` + `rel=noopener noreferrer`

## 不要做

- 再叠 wave/particle 第二套背景
- 把楼宇做成卡片墙
- 为都市引入重型引擎或 p5

## 验收

- [ ] 首屏可见品牌与都市天际线
- [ ] Changelog、四座社交楼、RSS 亭均可到达
- [ ] 站内建筑与 CTA 路由正确（含英文 locale）
- [ ] 深色模式夜景/窗灯/路灯生效
- [ ] 减少动态效果时无持续 rAF
