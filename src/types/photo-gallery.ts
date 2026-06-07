/** 相册 / 画廊 JSON 接口与客户端 masonry 渲染共用结构 */
export interface PhotoGalleryItem {
  uuid: string
  src: string
  desc: string
  thumbnail: string
  placeholder: string
  aspectRatio: number
}
