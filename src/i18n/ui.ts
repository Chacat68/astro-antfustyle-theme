import type { AppLocale } from './locales'

export const UI_STRINGS: Record<AppLocale, Record<string, string>> = {
  zh: {
    // Nav
    'nav.blog': '博客',
    'nav.projects': '项目',
    'nav.friends': '友链',
    'nav.photos': '相册',
    'nav.gallery': 'AI作品集',
    'nav.changelog': '更新日志',
    'nav.about': '关于',

    // Global / a11y
    'a11y.mainMenu': '主菜单',
    'a11y.navigation': '导航',
    'a11y.search': '搜索',
    'a11y.searchCategories': '搜索分类',
    'a11y.themeToggle': '切换明暗主题',
    'a11y.rssFeed': 'RSS 订阅',
    'a11y.languageSwitch': '切换语言',
    'a11y.languageCurrent': '当前语言',
    'a11y.skipToContent': '跳到正文',
    'a11y.openInNewTab': '在新标签页打开',
    'a11y.pageSections': '页面分区',
    'a11y.openToc': '打开目录',
    'a11y.scrollToTop': '回到顶部',
    'a11y.imageCarousel': '图片轮播',
    'a11y.openViewer': '打开图片查看器',
    'a11y.layoutToggle': '切换布局',
    'a11y.postList': '文章列表',
    'a11y.streamList': '动态列表',
    'a11y.feedList': '订阅列表',
    'a11y.keyboardShortcuts': '键盘快捷键',

    // Search panel
    'search.navigate': '导航',
    'search.goToPage': '打开页面',
    'search.close': '关闭',
    'search.loading': '加载中...',
    'search.error': '出错了，请重试。',
    'search.noResults': '未找到相关结果。',
    'search.more': '更多 +{count}',
    'search.all': '全部 {count}',
    'search.placeholder': '搜索',
    'search.placeholderScoped': '搜索 {type}',

    // Theme
    'theme.light': '亮色',
    'theme.dark': '暗色',

    // Post meta
    'post.updated': '更新于',
    'post.min': '分钟',
    'post.minRead': '分钟阅读',

    // List item
    'list.video': '提供视频版本',
    'list.radio': '提供音频版本',

    // Widgets
    'widget.latestPosts': '最新文章',
    'widget.categories': '内容分类',

    // Site stats
    'sitestats.title': '网站数据统计',
    'sitestats.tag': '// SITE_STATS',
    'sitestats.status': '{count} POSTS · LIVE',
    'sitestats.operatingTime': '经营时间',
    'sitestats.operatingTimeMain': '自 {start} 至今，共 {days} 天',
    'sitestats.operatingTimeSub': '（{years}年{months}个月{days}天）',
    'sitestats.daysUnit': '天',
    'sitestats.sinceStart': 'SINCE {start}',
    'sitestats.totalWords': '全部文章总字数',
    'sitestats.postsPerYear': '// YEARLY_OUTPUT',
    'sitestats.yearItemCount': '{count} 篇',
    'sitestats.noData': '暂无数据',
    'sitestats.footerSrc': 'SRC://BLOG',
    'sitestats.footerSince': 'SINCE {start}',

    // ToC
    'toc.title': '目录',
    'toc.scrollTo': '滚动到 {text}',

    // Footer
    'footer.back': '返回上级',

    // Empty states
    'list.empty': '这里还没有内容',
    'photo.empty': '这里还没有图片',
    'photo.error': '图片加载失败，请稍后重试',

    // Callouts
    'callout.warning': '提示',

    // Warnings (HTML)
    'warning.noContentHtml':
      '暂无可展示的内容。请按需检查并修改 <code>{file}</code>。',
    'warning.collectionNotBuiltInHtml':
      "集合类型 '{collectionType}' 不是内置类型。请修改 <code>{file}</code> 以渲染它。",
    'warning.draftPostHtml':
      '这是一篇草稿文章，生产环境不会发布。请在 frontmatter 中将 <code>draft</code> 设为 <code>false</code> 或移除该字段以发布。',

    // GitHub view
    'github.noDataWarningHtml':
      "暂无可展示的 GitHub 数据。请查看 <a href='{href}'>自定义 GitHub 活动页</a> 了解详情。",
    'github.lastFetched': '上次拉取：',
    'github.scheduledRefresh': '定时刷新：',
    'github.everySaturday': '每周六',
    'github.see': '查看',
    'github.toConfigure': '以配置你自己的页面',
    'github.configGuideTitle': '自定义 GitHub 活动页',
    'github.inspiredBy': '灵感来自',

    // Share
    'share.shareOn': '分享到',
    'share.title.twitter': '发推分享这篇文章',
    'share.title.bluesky': '分享到 Bluesky',
    'share.title.mastodon': '分享到 Mastodon',
    'share.title.facebook': '分享到 Facebook',
    'share.title.pinterest': '分享到 Pinterest',
    'share.title.reddit': '分享到 Reddit',
    'share.title.telegram': '通过 Telegram 分享',
    'share.title.whatsapp': '通过 WhatsApp 分享',
    'share.title.email': '通过邮件分享',
    'share.reading': '正在阅读 {url}\n\n我的想法是...',
    'share.readingWithAuthor': '正在阅读 {author} 的 {url}\n\n我的想法是...',

    // Pages
    'page.404.description': '页面未找到',
    'page.404.message': '这里什么也没有，不过很高兴见到你！',
    'page.blog.title': '博客',
    'page.blog.subtitle':
      '最近专注于读书、创作和跑步，持续创作新内容，为自己源源不断地创造心流体验。',
    'page.blog.description':
      '你好，我是 Charliefoo，85 后游戏迷和书迷。在这里分享阅读笔记、跑步记录、游戏开发心得和生活感悟。',
    'page.shorts.title': '短分享',
    'page.shorts.subtitle': '分享一些短笔记或碎碎念',
    'page.shorts.description': '分享一些短笔记或碎碎念',
    'page.projects.title': '项目',
    'page.projects.subtitle': '正在参与制作的项目，内容创作等',
    'page.projects.description':
      '付之一笑项目集：正在参与的游戏开发、内容创作与技术探索，含开源工具、独立作品与长期实验项目，欢迎查看与参与。',
    'page.friends.title': '友链',
    'page.friends.subtitle': '我的朋友们，感谢你们的支持与陪伴',
    'page.friends.description':
      '付之一笑友链页：收录博客伙伴与创作者链接，感谢一路以来的支持、交流与陪伴，也欢迎志同道合的朋友互换友链。',
    'page.photos.title': '相册',
    'page.photos.subtitle': '我的个人相册，记录生活中的美好瞬间',
    'page.photos.description':
      '个人手机摄影相册：记录旅途、日常与值得留住的瞬间，以镜头捕捉光影、情绪与生活里那些细碎而真实的感动。',
    'page.gallery.title': 'AI作品集',
    'page.gallery.subtitle': '用生成式 AI 创作的图像与视觉实验',
    'page.gallery.description':
      'AI 视觉作品集：集中展示生成式 AI 辅助创作的插画、概念图与视觉习作，数据来自本地 JSON 与可选配图目录。',
    'page.gallery.empty': '这里还没有 AI 作品',
    'page.gallery.filterAll': '全部',
    'page.gallery.filterAria': '按作品标签筛选',
    'page.gallery.emptyFilter': '该标签下暂无作品，试试其他标签',
    'page.changelog.title': '更新日志',
    'page.changelog.subtitle': '',
    'page.changelog.description':
      '记录付之一笑博客的每一次版本迭代：功能更新、设计优化、SEO 改进与技术重构，追踪站点持续演进的全过程。',
    'page.feeds.title': 'Astro Blog',
    'page.feeds.subtitle':
      '示例：使用 @ascorbic/feed-loader 获取 Astro 官方博客文章',
    'page.feeds.description':
      '主题示例页，展示如何集成外部 RSS 源。该页面不对搜索引擎开放索引。',
    'page.streams.title': 'Astro Streams',
    'page.streams.subtitle': '示例：使用本地 JSON 数据展示 Astro 动态流',
    'page.streams.description':
      '主题示例页，演示社交媒体式信息流布局。该页面不对搜索引擎开放索引。',
    'page.highlights.title': '精选集',
    'page.highlights.subtitle': '展示创意作品或精选内容',
    'page.highlights.description':
      '主题示例页，瀑布流展示精选内容。该页面不对搜索引擎开放索引。',
    'page.releases.title': 'AstroEco 正在发布…',
    'page.releases.description':
      '使用 astro-loader-github-releases 展示 GitHub Releases',
    'page.releases.heading': 'AstroEco 正在',
    'page.releases.headingEmphasis': '发布…',
    'page.releases.subtitlePrefix': '使用',
    'page.releases.subtitleSuffix': '展示你的 GitHub Releases',
    'page.prs.title': 'AstroEco 正在贡献…',
    'page.prs.description':
      '使用 astro-loader-github-prs 展示 GitHub Pull Requests',
    'page.prs.heading': 'AstroEco 正在',
    'page.prs.headingEmphasis': '贡献…',
    'page.prs.subtitlePrefix': '使用',
    'page.prs.subtitleSuffix': '展示你的 GitHub Pull Requests',

    'page.home.title': '付之一笑',
    'page.home.description':
      '付之一笑 — Charliefoo 的个人博客入口。故障艺术视觉下的阅读、跑步、思考与创作。',
    'page.about.title': '关于',
    'page.about.description':
      '付之一笑 — Charliefoo 的个人介绍：博客历程、写作理念与联系方式。',

    // About page — 博客故事与理念
    'about.blog.title': '关于博客',
    'about.history.title': '博客历程',
    'about.history.item1':
      '<strong>2008-2013年</strong> 在网易平台写博客，通过博客结识了几位重要的朋友，也养成了记录生活的习惯',
    'about.history.item2':
      '<strong>2013-2016年</strong> 转移到Lofter继续创作，期间搬到上海生活，工作日渐繁忙，创作暂时搁置',
    'about.history.item3':
      '<strong>2019年</strong> 重新启动博客，迁移到Typlog平台，正式将博客命名为《付之一笑》',
    'about.history.item4':
      '<strong>2023年</strong> 采用Notion+Vercel+Github技术方案，摆脱托管束缚，专注于内容创作',
    'about.history.item5':
      '<strong>2024年</strong> 加入《<a href="https://foreverblog.cn/" target="_blank" rel="noopener noreferrer">十年之约</a>》项目，立志持续更新十年以上',
    'about.history.item6':
      '<strong>2025年</strong> 使用Astro进行静态化重构，显著提升访问速度',
    'about.philosophy.title': '博客理念',
    'about.philosophy.time.title': '写出穿越时间的文字',
    'about.philosophy.time.imgAlt': '写出穿越时间的文字配图',
    'about.philosophy.time.p1':
      '每一篇文字都带着我的主观色彩，这是无法避免的，也是珍贵的。我不追求绝对的客观，但我努力保持诚实——诚实地面对自己的局限，诚实地记录当下的思考。',
    'about.philosophy.time.p2':
      '文字是有生命力的。今天写下的句子，可能在明天看来稚嫩，在明年看来偏颇。但正是这种时间的痕迹，让文字变得真实而动人。我会不断地修剪、编辑，让那些经得起时间考验的思考重新绽放光彩。',
    'about.philosophy.time.p3':
      '就像园丁精心呵护花园一样，我希望这个数字空间能够四季常青，花开不败。',
    'about.philosophy.free.title': '表达自由且克制',
    'about.philosophy.free.imgAlt': '表达自由且克制配图',
    'about.philosophy.free.p1':
      '自由是我写作的起点，克制是我表达的边界。我相信真正的自由来自于对世界的深度理解，而不是肆意的宣泄。',
    'about.philosophy.free.p2':
      '在这里，我会从多个维度审视同一个问题，寻找那些跨越时代的智慧。我努力学习不同学科的思维模型，用它们来解构生活中的复杂现象，为自己和读者提供新的视角。',
    'about.philosophy.free.p3':
      '质疑是思考的开始，分析是理解的路径，思辨是智慧的体现。我希望每一篇文字都能经得起这样的检验。',
    'about.philosophy.simple.title': '记录简单的生活',
    'about.philosophy.simple.imgAlt': '记录简单的生活配图',
    'about.philosophy.simple.p1':
      '复杂的世界需要简单的生活来平衡。我选择将精力集中在真正重要的事情上，减少不必要的选择疲劳，为创作留出更多的心理空间。',
    'about.philosophy.simple.lead': '生活的简单体现在三个维度：',
    'about.philosophy.simple.item1':
      '<strong>身体层面</strong> — 保持规律的运动，让身体分泌更多快乐因子',
    'about.philosophy.simple.item2':
      '<strong>精神层面</strong> — 维持稳定的阅读与写作节奏，保持大脑的活跃状态',
    'about.philosophy.simple.item3':
      '<strong>社会层面</strong> — 主动观察世界的多样性，避免陷入信息茧房的陷阱',
    'about.philosophy.simple.p2':
      '简单不是贫乏，而是对复杂性的有意选择。',
    'about.contact.title': '与我联系',
    'about.contact.p1':
      '感谢你耐心读到这里，也感谢你对我和这个数字花园的关注。如果我的文字触动了你，或者你有任何想法想要分享，都非常欢迎与我交流。',
    'about.contact.p2': '每一次真诚的对话都是珍贵的礼物。',
    'about.contact.email': '邮件：',

    // Home content
    'home.glitch.line1': '付之',
    'home.glitch.line2': '一笑',
    'home.glitch.skip': '跳过',
    'home.glitch.aria': '故障艺术首页展示台',
    'home.glitch.portalsAria': '站点功能入口',
    'home.glitch.socialsAria': '社交媒体',
    'home.glitch.toolsAria': '站点工具',
    'home.intro1':
      '你好，我是Charliefoo，85后，从小就是游戏迷和书迷，这两样爱好至今仍是我生活的重要支柱。',
    'home.intro2':
      '最近专注于读书、创作和跑步，享受安静而有趣的生活节奏。喜欢喝茶聊天，持续创作新内容，为自己源源不断地创造心流体验。',
    'home.roles':
      '🎮 游戏开发者 | ✍️ 内容创作者 | 📱 手机摄影师 | 💻 vibe coding 苦手',
    'home.findMeOn': '找到我：',
    'home.thanks':
      '感谢你阅读我的博客！如果这些内容对你有所启发或帮助，那就是对我最大的鼓励。你的支持和陪伴，意义非凡。谢谢！❤️',

    // Language names
    'lang.zh': '中文',
    'lang.en': 'English',
  },
  en: {
    // Nav
    'nav.blog': 'Blog',
    'nav.projects': 'Projects',
    'nav.friends': 'Friends',
    'nav.photos': 'Photos',
    'nav.gallery': 'AI Gallery',
    'nav.changelog': 'Changelog',
    'nav.about': 'About',

    // Global / a11y
    'a11y.mainMenu': 'Main menu',
    'a11y.navigation': 'Navigation',
    'a11y.search': 'Search',
    'a11y.searchCategories': 'Search categories',
    'a11y.themeToggle': 'Toggle light & dark',
    'a11y.rssFeed': 'RSS Feed',
    'a11y.languageSwitch': 'Switch language',
    'a11y.languageCurrent': 'Current language',
    'a11y.skipToContent': 'Skip to content',
    'a11y.openInNewTab': 'Open in new tab',
    'a11y.pageSections': 'Page sections',
    'a11y.openToc': 'Open table of contents',
    'a11y.scrollToTop': 'Scroll to top',
    'a11y.imageCarousel': 'Image carousel',
    'a11y.openViewer': 'Open image viewer',
    'a11y.layoutToggle': 'Layout toggle',
    'a11y.postList': 'Post list',
    'a11y.streamList': 'Stream list',
    'a11y.feedList': 'Feed list',
    'a11y.keyboardShortcuts': 'Keyboard shortcuts',

    // Search panel
    'search.navigate': 'Navigate',
    'search.goToPage': 'Go to page',
    'search.close': 'Close',
    'search.loading': 'Loading...',
    'search.error': 'Oops! Something went wrong. Try again.',
    'search.noResults': 'No results found.',
    'search.more': 'More +{count}',
    'search.all': 'All {count}',
    'search.placeholder': 'Search',
    'search.placeholderScoped': 'Search {type}',

    // Theme
    'theme.light': 'light',
    'theme.dark': 'dark',

    // Post meta
    'post.updated': 'Updated',
    'post.min': 'min',
    'post.minRead': 'min read',

    // List item
    'list.video': 'Provided in video',
    'list.radio': 'Provided in radio',

    // Widgets
    'widget.latestPosts': 'Latest posts',
    'widget.categories': 'Categories',

    // Site stats
    'sitestats.title': 'Site stats',
    'sitestats.tag': '// SITE_STATS',
    'sitestats.status': '{count} POSTS · LIVE',
    'sitestats.operatingTime': 'Uptime',
    'sitestats.operatingTimeMain': 'Since {start}, {days} days in total',
    'sitestats.operatingTimeSub': '({years}y {months}m {days}d)',
    'sitestats.daysUnit': 'days',
    'sitestats.sinceStart': 'SINCE {start}',
    'sitestats.totalWords': 'Total words',
    'sitestats.postsPerYear': '// YEARLY_OUTPUT',
    'sitestats.yearItemCount': '{count} posts',
    'sitestats.noData': 'No data yet',
    'sitestats.footerSrc': 'SRC://BLOG',
    'sitestats.footerSince': 'SINCE {start}',

    // ToC
    'toc.title': 'Table of Contents',
    'toc.scrollTo': 'Scroll to {text}',

    // Footer
    'footer.back': 'cd ..',

    // Empty states
    'list.empty': 'nothing here yet',
    'photo.empty': 'No images yet',
    'photo.error': 'Failed to load images. Please try again later.',

    // Callouts
    'callout.warning': 'WARNING',

    // Warnings (HTML)
    'warning.noContentHtml':
      'No content available for display. Please review and modify <code>{file}</code> as needed.',
    'warning.collectionNotBuiltInHtml':
      "The '{collectionType}' collection type is not built-in. Modify <code>{file}</code> to render it.",
    'warning.draftPostHtml':
      "This is a draft post that will not be published in production. Set the post's <code>draft</code> property in frontmatter to <code>false</code> or remove it to publish the post.",

    // GitHub view
    'github.noDataWarningHtml':
      "No GitHub data available for display. See <a href='{href}'>Customizing GitHub Activity Pages</a> for details.",
    'github.lastFetched': 'Last fetched:',
    'github.scheduledRefresh': 'Scheduled refresh:',
    'github.everySaturday': 'Every Saturday',
    'github.see': 'See',
    'github.toConfigure': 'to configure your own',
    'github.configGuideTitle': 'Customizing GitHub Activity Pages',
    'github.inspiredBy': 'Inspired by',

    // Share
    'share.shareOn': 'share on',
    'share.title.twitter': 'Tweet this post',
    'share.title.bluesky': 'Share this post on Bluesky',
    'share.title.mastodon': 'Share this post on Mastodon',
    'share.title.facebook': 'Share this post on Facebook',
    'share.title.pinterest': 'Share this post on Pinterest',
    'share.title.reddit': 'Share this post on Reddit',
    'share.title.telegram': 'Share this post via Telegram',
    'share.title.whatsapp': 'Share this post via WhatsApp',
    'share.title.email': 'Share this post via email',
    'share.reading': 'Reading {url}\n\nI think...',
    'share.readingWithAuthor': "Reading {author}'s {url}\n\nI think...",

    // Pages
    'page.404.description': 'Page not found',
    'page.404.message': 'Nice to meet you tho!',
    'page.blog.title': 'Blog',
    'page.blog.subtitle':
      'Reading notes, running logs, creative work, and life.',
    'page.blog.description':
      "Charliefoo's personal blog on reading, running, game development, AI tools, music, and everyday creative practice.",
    'page.shorts.title': 'Shorts',
    'page.shorts.subtitle': 'Share your short notes or quick thoughts',
    'page.shorts.description': 'Share your short notes or quick thoughts',
    'page.projects.title': 'Projects',
    'page.projects.subtitle': 'Projects, creations and more',
    'page.projects.description':
      'A collection of projects and creations I am working on. Feel free to explore and join!',
    'page.friends.title': 'Friends',
    'page.friends.subtitle': 'My friends, thanks for your support',
    'page.friends.description':
      'A collection of my blog friends. Thanks for their support and companionship!',
    'page.photos.title': 'Photos',
    'page.photos.subtitle': 'Personal photos and moments from daily life',
    'page.photos.description':
      'A personal photo gallery collecting daily moments, mobile photography, and visual notes from life.',
    'page.gallery.title': 'AI Art Gallery',
    'page.gallery.subtitle':
      'Images and visual experiments made with generative AI',
    'page.gallery.description':
      'A dedicated gallery for AI-assisted illustrations, concept art, and visual studies. Entries are driven by local JSON and optional assets under `src/content/ai-gallery/`.',
    'page.gallery.empty': 'No AI artwork yet',
    'page.gallery.filterAll': 'All',
    'page.gallery.filterAria': 'Filter by artwork tag',
    'page.gallery.emptyFilter': 'No pieces with this tag. Try another tag.',
    'page.changelog.title': 'Changelog',
    'page.changelog.subtitle': '',
    'page.changelog.description':
      'Release notes for foo-z.com: feature updates, design improvements, SEO work, and technical refactors across each site version.',
    'page.feeds.title': 'Astro Blog',
    'page.feeds.subtitle':
      'Example: fetching Astro blog posts with @ascorbic/feed-loader',
    'page.feeds.description':
      'Theme demo page for external RSS integration. Excluded from search engine indexing.',
    'page.streams.title': 'Astro Streams',
    'page.streams.subtitle':
      'Example: displaying Astro streams with local JSON data',
    'page.streams.description':
      'Theme demo page for a social-style activity stream. Excluded from search engine indexing.',
    'page.highlights.title': 'Highlights',
    'page.highlights.subtitle': 'Showcase creative work or curated posts',
    'page.highlights.description':
      'Theme demo page with a masonry highlights layout. Excluded from search engine indexing.',
    'page.releases.title': 'AstroEco is Releasing...',
    'page.releases.description':
      'Display your GitHub releases using astro-loader-github-releases',
    'page.releases.heading': 'AstroEco is',
    'page.releases.headingEmphasis': 'Releasing...',
    'page.releases.subtitlePrefix': 'Display your GitHub releases using',
    'page.releases.subtitleSuffix': '',
    'page.prs.title': 'AstroEco is Contributing...',
    'page.prs.description':
      'Display your GitHub pull requests using astro-loader-github-prs',
    'page.prs.heading': 'AstroEco is',
    'page.prs.headingEmphasis': 'Contributing...',
    'page.prs.subtitlePrefix': 'Display your GitHub pull requests using',
    'page.prs.subtitleSuffix': '',

    'page.home.title': 'FOO-Z',
    'page.home.description':
      "Charliefoo's personal blog portal — reading, running, thinking, and creating, framed in glitch art.",
    'page.about.title': 'About',
    'page.about.description':
      "About Charliefoo — blog journey, writing philosophy, and how to get in touch.",

    // About page — blog story & philosophy
    'about.blog.title': 'About this blog',
    'about.history.title': 'Blog journey',
    'about.history.item1':
      '<strong>2008–2013</strong> Wrote on NetEase Blog; made a few lasting friends and formed the habit of keeping a journal',
    'about.history.item2':
      '<strong>2013–2016</strong> Moved to Lofter; life in Shanghai got busier and writing went on pause',
    'about.history.item3':
      '<strong>2019</strong> Restarted on Typlog and named the blog 《付之一笑》 (Foo-Z)',
    'about.history.item4':
      '<strong>2023</strong> Switched to Notion + Vercel + GitHub—own the stack, focus on writing',
    'about.history.item5':
      '<strong>2024</strong> Joined <a href="https://foreverblog.cn/" target="_blank" rel="noopener noreferrer">Forever Blog</a>, committing to keep updating for ten years and beyond',
    'about.history.item6':
      '<strong>2025</strong> Rebuilt as a static site with Astro for a much faster experience',
    'about.philosophy.title': 'Writing philosophy',
    'about.philosophy.time.title': 'Words that travel through time',
    'about.philosophy.time.imgAlt': 'Illustration for words that travel through time',
    'about.philosophy.time.p1':
      'Every piece carries my subjectivity—that’s unavoidable, and precious. I don’t chase absolute objectivity, but I try to stay honest: honest about my limits, honest about what I think right now.',
    'about.philosophy.time.p2':
      'Words are alive. A sentence written today may look naive tomorrow and one-sided next year. That trace of time is what makes writing feel real. I keep pruning and editing so ideas that hold up can bloom again.',
    'about.philosophy.time.p3':
      'Like a gardener tending a plot, I hope this digital space stays green through the seasons—flowers that don’t fade.',
    'about.philosophy.free.title': 'Free, yet restrained',
    'about.philosophy.free.imgAlt': 'Illustration for free yet restrained expression',
    'about.philosophy.free.p1':
      'Freedom is where writing starts; restraint is its boundary. Real freedom comes from understanding the world deeply—not from dumping everything without care.',
    'about.philosophy.free.p2':
      'Here I look at the same question from several angles, hunting for wisdom that lasts across eras. I borrow mental models from different fields to unpack everyday complexity, and offer fresh frames for myself and for readers.',
    'about.philosophy.free.p3':
      'Doubt begins thought; analysis charts the path; discernment is wisdom in practice. I hope every piece can stand that test.',
    'about.philosophy.simple.title': 'Recording a simple life',
    'about.philosophy.simple.imgAlt': 'Illustration for recording a simple life',
    'about.philosophy.simple.p1':
      'A complex world needs a simple life for balance. I put energy into what matters, cut decision fatigue, and leave more mental room for making things.',
    'about.philosophy.simple.lead': 'Simplicity shows up in three layers:',
    'about.philosophy.simple.item1':
      '<strong>Body</strong> — steady movement, more of the chemistry that feels like joy',
    'about.philosophy.simple.item2':
      '<strong>Mind</strong> — a stable rhythm of reading and writing to keep the mind awake',
    'about.philosophy.simple.item3':
      '<strong>Society</strong> — actively notice diversity, and dodge the information cocoon',
    'about.philosophy.simple.p2':
      'Simple isn’t scarce—it’s choosing complexity on purpose.',
    'about.contact.title': 'Get in touch',
    'about.contact.p1':
      'Thanks for reading this far, and for caring about me and this digital garden. If something here moved you, or you have thoughts to share, I’d love to hear from you.',
    'about.contact.p2': 'Every sincere conversation is a rare gift.',
    'about.contact.email': 'Email: ',

    // Home content
    'home.glitch.line1': 'FOO',
    'home.glitch.line2': 'Z',
    'home.glitch.skip': 'Skip',
    'home.glitch.aria': 'Glitch art home stage',
    'home.glitch.portalsAria': 'Site portals',
    'home.glitch.socialsAria': 'Social links',
    'home.glitch.toolsAria': 'Site tools',
    'home.intro1':
      "Hi, I'm Charliefoo. I've been a gamer and a bookworm since childhood—both are still a big part of my life today.",
    'home.intro2':
      "Lately I'm focusing on reading, creating, and running—enjoying a quiet but interesting rhythm. I love tea and long chats, and I keep making new things to stay in flow.",
    'home.roles':
      '🎮 Game developer | ✍️ Creator | 📱 Mobile photographer | 💻 Vibe-coding newbie',
    'home.findMeOn': 'Find me on',
    'home.thanks':
      'Thanks for reading! If anything here helps or inspires you, that means a lot to me. Your support and company matter more than you know. Thank you! ❤️',

    // Language names
    'lang.zh': '中文',
    'lang.en': 'English',
  },
}
