import {
  defineConfig,
  presetWind3,
  presetAttributify,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { createRequire } from 'node:module'

import { UI } from './src/config'
import projecstData from './src/content/projects/data.json'

import type {
  IconNavItem,
  ResponsiveNavItem,
  IconSocialItem,
  ResponsiveSocialItem,
} from './src/types'

const require = createRequire(import.meta.url)

/**
 * 从 @iconify/json 显式加载图标集。
 * Cursor / VS Code 会设置 VSCODE_CWD，导致 preset-icons 跳过 node-loader，
 * 导航等动态 class 图标会整层消失；显式 collections 可绕过该限制。
 */
function iconifyCollection(name: string) {
  return () => require(`@iconify/json/json/${name}.json`)
}

const iconCollections = Object.fromEntries(
  [
    'ri',
    'uil',
    'ph',
    'logos',
    'unjs',
    'simple-icons',
    'meteor-icons',
    'grommet-icons',
    'carbon',
    'lucide',
    'material-symbols',
    'hugeicons',
    'famicons',
    'bx',
  ].map((name) => [name, iconifyCollection(name)])
)

const { internalNavs, socialLinks, githubView } = UI
const navIcons = internalNavs
  .filter(
    (item) =>
      item.displayMode !== 'alwaysText' &&
      item.displayMode !== 'textHiddenOnMobile'
  )
  .map((item) => (item as IconNavItem | ResponsiveNavItem).icon)
const socialIcons = socialLinks
  .filter(
    (item) =>
      item.displayMode !== 'alwaysText' &&
      item.displayMode !== 'textHiddenOnMobile'
  )
  .map((item) => (item as IconSocialItem | ResponsiveSocialItem).icon)

const projectIcons = projecstData.map((item) => item.icon)

// 终端青系语义色（与 HUD accent 同族）
const githubVersionColor: Record<string, string> = {
  major: 'bg-[#0891b2]/20 text-[#0e7490] dark:text-[#67e8f9]',
  minor: 'bg-[#0e7490]/20 text-[#155e75] dark:text-[#22d3ee]',
  patch: 'bg-[#22d3ee]/20 text-[#0e7490] dark:text-[#a5f3fc]',
  pre: 'bg-[#a5f3fc]/20 text-[#164e63] dark:text-[#67e8f9]',
}
const githubVersionClass = Object.keys(githubVersionColor).map(
  (k) => `github-${k}`
)
const githubSubLogos = githubView.subLogoMatches.map((item) => item[1])

export default defineConfig({
  // Astro 5 no longer pipes `src/content/**/*.{md,mdx}` through Vite
  content: {
    filesystem: ['./src/{content,pages}/**/*.{md,mdx}'],
  },

  // will be deep-merged to the default theme
  extendTheme: (theme) => {
    return {
      ...theme,
      breakpoints: {
        ...theme.breakpoints,
        lgp: '1128px',
      },
      // 字体文件见 src/styles/fonts.css（仅 latin，避免 presetWebFonts 全子集膨胀）
      fontFamily: {
        ...theme.fontFamily,
        sans: '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Noto Sans SC", "Microsoft YaHei", sans-serif',
        mono: '"DM Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        condensed:
          '"IBM Plex Sans Condensed", "IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
        serif:
          'Newsreader, ui-serif, Georgia, "Times New Roman", "Songti SC", "Noto Serif SC", serif',
      },
    }
  },

  // define utility classes and the resulting CSS
  rules: [],

  // combine multiple rules as utility classes
  shortcuts: [
    [
      /^(\w+)-transition(?:-(\d+))?$/,
      (match) =>
        `transition-${match[1] === 'op' ? 'opacity' : match[1]} duration-${match[2] ? match[2] : '300'} ease-in-out`,
    ],
    [
      /^shadow-custom_(-?\d+)_(-?\d+)_(-?\d+)_(-?\d+)$/,
      ([_, x, y, blur, spread]) =>
        `shadow-[${x}px_${y}px_${blur}px_${spread}px_rgba(0,0,0,0.2)] dark:shadow-[${x}px_${y}px_${blur}px_${spread}px_rgba(255,255,255,0.25)]`,
    ],
    [
      /^btn-(\w+)$/,
      ([_, color]) =>
        `px-2.5 py-1 border border-[var(--c-border)]! rounded op-50 transition-all duration-200 ease-out no-underline! hover:(op-100 text-${color} bg-${color}/10)`,
    ],
    [
      /^github-(major|minor|patch|pre)$/,
      ([, version]) => `rounded ${githubVersionColor[version]}`,
    ],
  ],

  // presets are partial configurations
  presets: [
    presetWind3(),
    presetAttributify({
      strict: true,
      prefix: 'u-',
      prefixedOnly: false,
    }),
    presetIcons({
      collections: iconCollections,
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
  ],

  // provides a unified interface to transform source code in order to support conventions
  transformers: [transformerDirectives(), transformerVariantGroup()],

  // work around the limitation of dynamically constructed utilities
  // https://unocss.dev/guide/extracting#limitations
  safelist: [
    ...navIcons,
    ...socialIcons,
    ...projectIcons,

    /* BaseLayout */
    'focus:not-sr-only',
    'focus:fixed',
    'focus:start-1',
    'focus:top-1.5',
    'focus:op-20',

    /* GithubItem */
    ...githubVersionClass,
    ...githubSubLogos,

    /* Toc */
    'i-ri-menu-2-fill',
    'i-ri-menu-3-fill',
  ],
})
