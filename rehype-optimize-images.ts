import { visit } from 'unist-util-visit'

/**
 * 正文图片性能：默认 lazy + async decoding；首图保留 eager 以利 LCP。
 * 不拉取 COS 原图尺寸（境外构建易超时），宽高仍依赖作者在 markdown 中声明
 * 或 CDN 侧 imageSlim / imageMogr2。
 */
export default function rehypeOptimizeImages() {
  // @ts-expect-error hast 树由 unified 传入，与项目其它 rehype 插件一致不加 hast 类型包
  return (tree) => {
    let imageIndex = 0

    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return

      const props = node.properties ?? (node.properties = {})
      const isFirst = imageIndex === 0
      imageIndex += 1

      if (props.loading == null) {
        props.loading = isFirst ? 'eager' : 'lazy'
      }
      if (props.decoding == null) {
        props.decoding = 'async'
      }
      if (isFirst && props.fetchpriority == null) {
        props.fetchpriority = 'high'
      }
    })
  }
}
