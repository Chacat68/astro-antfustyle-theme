/** AI 作品集条目可选分类（与 `data.json` 中 `kind` 一致） */
export type PhotoGalleryKind = 'character' | 'scene'

/** 相册 / 画廊 JSON 接口与客户端 masonry 渲染共用结构 */
export interface PhotoGalleryItem {
  uuid: string
  src: string
  desc: string
  thumbnail: string
  placeholder: string
  aspectRatio: number
  /** 仅 AI 画廊使用；未设置时仅在「全部」下展示 */
  kind?: PhotoGalleryKind
}
