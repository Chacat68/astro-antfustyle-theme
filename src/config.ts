import type { Site, Ui, Features } from './types'

export const SITE: Site = {
  website: 'https://foo-z.com/',
  base: '/',
  title: '付之一笑',
  description:
    '付之一笑 — Charliefoo 的个人博客。分享阅读笔记、跑步记录、技术思考与创作心得，记录生活中的每一个值得回味的瞬间。',
  descriptionEn:
    "Foo-Z (付之一笑) — Charliefoo's personal blog: reading notes, running logs, technical thinking, and creative writing.",
  author: 'Charliefoo',
  lang: 'zh-CN',
  ogLocale: 'zh_CN',
  imageDomains: [
    'cdn.bsky.app',
    'images.unsplash.com',
    // 故意不加入腾讯云 COS：Cloudflare Builds 从境外拉上海 COS 做
    // inferSize/优化时易超时，Astro 会以「Failed to parse image reference」中断构建。
    // 正文 COS 图走原链（可带 ?imageSlim / imageMogr2），由 CDN 侧处理。
  ],
}

export const UI: Ui = {
  // 注意：导航的 title/text 仅作 fallback，实际展示文案由
  // `src/i18n/ui.ts` 的 nav.* 键提供（见 NavBar.astro 的 navKeyByPath）
  internalNavs: [
    {
      path: '/blog',
      title: 'Blog',
      displayMode: 'alwaysText',
      text: 'Blog',
    },
    {
      path: '/projects',
      title: 'Projects',
      displayMode: 'alwaysText',
      text: 'Projects',
    },
    {
      path: '/photos',
      title: 'Photos',
      displayMode: 'alwaysText',
      text: 'Photos',
    },
    {
      path: '/gallery',
      title: 'Gallery',
      displayMode: 'alwaysText',
      text: 'Gallery',
    },
    {
      path: '/friends',
      title: 'Friends',
      displayMode: 'alwaysText',
      text: 'Friends',
    },
    {
      path: '/changelog',
      title: 'Changelog',
      displayMode: 'alwaysText',
      text: 'Changelog',
    },
    /*
    {
      path: '/highlights',
      title: 'Highlights',
      displayMode: 'iconToTextOnMobile',
      text: 'Highlights',
      icon: 'i-ri-screenshot-line',
    },
    */
    /*
    {
      path: '/shorts',
      title: 'Shorts',
      displayMode: 'iconToTextOnMobile',
      text: 'Shorts',
      icon: 'i-meteor-icons-grid',
    },
    */
  ],
  socialLinks: [
    {
      link: 'https://github.com/Chacat68',
      title: 'Github',
      displayMode: 'alwaysIcon',
      icon: 'i-uil-github-alt',
    },
    {
      link: 'https://x.com/Chacat68',
      title: 'Charliefoo on X',
      displayMode: 'alwaysIcon',
      icon: 'i-ri-twitter-x-fill',
    },
    {
      link: 'https://bsky.app/profile/chacat68.bsky.social',
      title: 'Charliefoo on Bluesky',
      displayMode: 'alwaysIcon',
      icon: 'i-meteor-icons-bluesky',
    },
    {
      link: 'https://neodb.social/users/Charliefoo/',
      title: 'Charliefoo on NeoDB',
      displayMode: 'alwaysIcon',
      icon: 'i-ph-book-open-duotone',
    },
  ],
  navBarLayout: {
    left: [],
    right: [
      'internalNavs',
      'hr',
      'searchButton',
      'langButton',
      'themeButton',
      'rssLink',
    ],
    // true：<1024px（lt-lg）收进汉堡，避免平板顶栏挤爆
    mergeOnMobile: true,
  },
  tabbedLayoutTabs: [
    { title: 'Changelog', path: '/changelog' },
    { title: 'AstroBlog', path: '/feeds' },
    { title: 'AstroStreams', path: '/streams' },
  ],
  postView: {
    postMetaStyle: 'minimal',
    useCoverAltAsCaption: true,
  },
  postMetaStyle: 'minimal',
  groupView: {
    showGroupItemColorOnHover: true,
  },
  githubView: {
    monorepos: [
      'withastro/astro',
      'withastro/starlight',
      'lin-stephanie/astro-loaders',
    ],
    mainLogoOverrides: [
      [/starlight/, 'https://starlight.astro.build/favicon.svg'],
    ],
    subLogoMatches: [
      [/theme/, 'i-unjs-theme-colors'],
      [/github/, 'https://github.githubassets.com/favicons/favicon.svg'],
      [/tweet/, 'i-prime-twitter'],
      [/ins/, 'i-skill-icons-instagram'],
      [/bluesky/, 'i-logos-bluesky'],
    ],
  },
  externalLink: {
    newTab: false,
    cursorType: '',
    showNewTabIcon: false,
  },
}

/**
 * Globally controls whether to enable special features:
 *  - Set to `false` or `[false, {...}]` to disable the feature.
 *  - Set to `[true, {...}]` to enable and configure the feature.
 */
export const FEATURES: Features = {
  // 页面进入动画
  slideEnterAnim: [true, { enterStep: 60 }],

  // Open Graph 图片生成配置
  ogImage: [
    true,
    {
      authorOrBrand: `${SITE.title}`,
      fallbackTitle: `${SITE.description}`,
      fallbackBgType: 'plum',
      collections: [
        { collection: 'blog', pathnamePrefix: '/blog' },
        { collection: 'changelog', pathnamePrefix: '/changelog' },
        { collection: 'shorts', pathnamePrefix: '/shorts' },
      ],
    },
  ],

  // 目录 (Table of Contents) 配置
  // displayMode: 'content' — 宽屏悬停正文展开；窄于 1400px 仅悬停目录展开
  toc: [
    true,
    {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
      displayPosition: 'right',
      displayMode: 'content',
    },
  ],

  // 分享按钮配置
  share: [
    true,
    {
      twitter: [true, '@Chacat68'],
      bluesky: [true, '@Chacat68.bsky.social'],
      mastodon: false,
      facebook: false,
      pinterest: false,
      reddit: false,
      telegram: false,
      whatsapp: false,
      email: false,
    },
  ],

  // 评论系统（关闭）。启用前请到 https://giscus.app 用本仓库重新生成 repo-id / category-id
  giscus: [
    false,
    {
      'data-repo': 'Chacat68/astro-antfustyle-theme',
      'data-repo-id': '',
      'data-category': 'Giscus',
      'data-category-id': '',
      'data-mapping': 'title',
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-lang': 'zh-CN',
    },
  ],

  // 搜索功能配置
  search: [
    true,
    {
      includes: ['blog', 'blog_en', 'shorts', 'changelog'],
      filter: true,
      navHighlight: true,
      batchLoadSize: [true, 8],
      maxItemsPerPage: [true, 3],
    },
  ],
  tag: [
    true,
    {
      displayPosition: 'right',
      displayMode: 'content',
      filterMode: 'AND',
    },
  ],
}
