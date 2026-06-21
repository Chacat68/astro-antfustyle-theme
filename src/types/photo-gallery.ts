/** 相册 / 画廊 JSON 接口与客户端 masonry 渲染共用结构 */
export interface PhotoGalleryItem {
  uuid: string
  src: string
  desc: string
  thumbnail: string
  placeholder: string
  aspectRatio: number
  /** 仅 AI 画廊使用；可属于多个标签，未设置时仅在「全部」下展示 */
  tags?: string[]
}
