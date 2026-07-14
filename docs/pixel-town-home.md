# 首页像素模拟小镇

主页主视觉由「像素模拟小镇」承担，替代原 `wave` 背景装饰。实现以文档为准，改动后请同步回写。

## 目标

- 一屏构成：品牌「付之一笑」→ 一句标题 → 一句说明 → CTA → 小镇场景
- 场景可逛：建筑是栏目入口，而不是纯装饰图
- 轻量：纯 Canvas 2D，不引入 p5
- 与全站 token 一致：天空蓝 accent、浅/深色模式、克制动效

## 信息架构

| 建筑 | 跳转 |
|------|------|
| 书店 | `/blog` |
| 工坊 | `/projects` |
| 照相馆 | `/photos` |
| 画廊 | `/gallery` |
| 咖啡馆 | `/friends` |

CTA：「走进书店」「参观工坊」与建筑导航重复强化主路径。

## 技术结构

| 文件 | 职责 |
|------|------|
| `src/pages/index.astro` | 首页编排：`bgType: false` + hero 文案 + `PixelTown` + 简介/最新文章 |
| `src/components/home/PixelTown.astro` | 320×180 画布绘制、动画循环、HTML 热点 |
| `src/styles/page.css`（`.home-sim*`） | 品牌层级、CTA、正文区节奏 |
| `src/i18n/ui.ts`（`home.town.*`） | 中英文文案 |

## 视觉规范

- 逻辑分辨率 **320×180**，CSS 铺满舞台，`image-rendering: pixelated`
- 浅色：晴空蓝绿草地；深色：夜空 + 窗灯琥珀
- 模拟元素：云漂移、烟囱烟、3 个村民沿小路往返
- `prefers-reduced-motion: reduce` 时只绘静止帧
- 热点 hover/focus：accent 内描边 + 像素标签；移动端标签常显

## 不要做

- 首屏再叠 wave/particle 等第二套背景
- 建筑做成卡片墙或大圆角媒体块
- 为小镇单独引入重型游戏引擎或 p5

## 验收

- [ ] 首页首屏可见品牌字标与小镇
- [ ] 五个建筑均可键盘 focus 并进入对应栏目
- [ ] 切换浅/深色主题后小镇配色即时更新
- [ ] 开启系统「减少动态效果」后无持续 rAF 动画
- [ ] 移动端可点建筑，标签可读
