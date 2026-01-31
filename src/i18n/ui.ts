import type { AppLocale } from './locales'

export const UI_STRINGS: Record<AppLocale, Record<string, string>> = {
  zh: {
    // Nav
    'nav.blog': '博客',
    'nav.projects': '项目',
    'nav.photos': '相册',
    'nav.changelog': '更新日志',

    // Global / a11y
    'a11y.mainMenu': '主菜单',
    'a11y.navigation': '导航',
    'a11y.search': '搜索',
    'a11y.searchCategories': '搜索分类',
    'a11y.themeToggle': '切换明暗主题',
    'a11y.rssFeed': 'RSS 订阅',
    'a11y.languageSwitch': '切换语言',
    'a11y.skipToContent': '跳到正文',
    'a11y.openInNewTab': '在新标签页打开',
    'a11y.pageSections': '页面分区',
    'a11y.openToc': '打开目录',
    'a11y.scrollToTop': '回到顶部',
    'a11y.imageCarousel': '图片轮播',
    'a11y.layoutToggle': '切换布局',
    'a11y.postList': '文章列表',
    'a11y.streamList': '动态列表',
    'a11y.feedList': '订阅列表',
    'a11y.keyboardShortcuts': '键盘快捷键',

    // Search panel
    'search.navigate': '导航',
    'search.goToPage': '打开页面',
    'search.close': '关闭',

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
    'sitestats.operatingTime': '经营时间',
    'sitestats.operatingTimeMain': '自 {start} 至今，共 {days} 天',
    'sitestats.operatingTimeSub': '（{years}年{months}个月{days}天）',
    'sitestats.totalWords': '全部文章总字数',
    'sitestats.postsPerYear': '每一年的文章数量',
    'sitestats.yearItemCount': '{count} 篇',
    'sitestats.noData': '暂无数据',

    // ToC
    'toc.title': '目录',

    // Empty states
    'list.empty': '这里还没有内容',

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
    'page.shorts.title': '短分享',
    'page.shorts.subtitle': '分享一些短笔记或碎碎念',
    'page.shorts.description': '分享一些短笔记或碎碎念',
    'page.projects.title': '项目',
    'page.projects.subtitle': '正在参与制作的项目，内容创作等',
    'page.projects.description':
      '这里展示了我正在参与制作的项目、内容创作等。欢迎查看并参与其中！',
    'page.friends.title': '友链',
    'page.friends.subtitle': '我的朋友们，感谢你们的支持与陪伴',
    'page.friends.description':
      '这里展示了我的博客朋友们，感谢他们的支持与陪伴！',
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

    'page.home.title': '关于',
    'page.home.description': '',

    // Home content
    'home.intro1':
      '你好，我是查猫CHACAT，85后，从小就是游戏迷和书迷，这两样爱好至今仍是我生活的重要支柱。',
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
    'nav.photos': 'Photos',
    'nav.changelog': 'Changelog',

    // Global / a11y
    'a11y.mainMenu': 'Main menu',
    'a11y.navigation': 'Navigation',
    'a11y.search': 'Search',
    'a11y.searchCategories': 'Search categories',
    'a11y.themeToggle': 'Toggle light & dark',
    'a11y.rssFeed': 'RSS Feed',
    'a11y.languageSwitch': 'Switch language',
    'a11y.skipToContent': 'Skip to content',
    'a11y.openInNewTab': 'Open in new tab',
    'a11y.pageSections': 'Page sections',
    'a11y.openToc': 'Open table of contents',
    'a11y.scrollToTop': 'Scroll to top',
    'a11y.imageCarousel': 'Image carousel',
    'a11y.layoutToggle': 'Layout toggle',
    'a11y.postList': 'Post list',
    'a11y.streamList': 'Stream list',
    'a11y.feedList': 'Feed list',
    'a11y.keyboardShortcuts': 'Keyboard shortcuts',

    // Search panel
    'search.navigate': 'Navigate',
    'search.goToPage': 'Go to page',
    'search.close': 'Close',

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
    'sitestats.operatingTime': 'Operating time',
    'sitestats.operatingTimeMain': 'Since {start}, {days} days in total',
    'sitestats.operatingTimeSub': '({years}y {months}m {days}d)',
    'sitestats.totalWords': 'Total word count',
    'sitestats.postsPerYear': 'Posts per year',
    'sitestats.yearItemCount': '{count} posts',
    'sitestats.noData': 'No data yet',

    // ToC
    'toc.title': 'Table of Contents',

    // Empty states
    'list.empty': 'nothing here yet',

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

    'page.home.title': 'About',
    'page.home.description': '',

    // Home content
    'home.intro1':
      "Hi, I'm CHACAT. I've been a gamer and a bookworm since childhood—both are still a big part of my life today.",
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
