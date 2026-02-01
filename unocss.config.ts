import {
  defineConfig,
  presetWind3,
  presetAttributify,
  presetIcons,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

import { UI } from './src/config'
import projecstData from './src/content/projects/data.json'

import type {
  IconNavItem,
  ResponsiveNavItem,
  IconSocialItem,
  ResponsiveSocialItem,
} from './src/types'

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

// 莫兰迪风格语义色
const githubVersionColor: Record<string, string> = {
  major: 'bg-[#B89A9A]/20 text-[#8B6F6F] dark:text-[#C9B0B0]',
  minor: 'bg-[#8BA7B8]/20 text-[#5E7A8A] dark:text-[#A3BCC9]',
  patch: 'bg-[#8BAB9A]/20 text-[#5E8A6F] dark:text-[#A3C9B4]',
  pre: 'bg-[#C9B896]/20 text-[#8A7A5E] dark:text-[#D8CDB0]',
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
        `px-2.5 py-1 border border-[#8884]! rounded op-50 transition-all duration-200 ease-out no-underline! hover:(op-100 text-${color} bg-${color}/10)`,
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
      extraProperties: {
        'display': 'inline-block',
        'height': '1.2em',
        'width': '1.2em',
        'vertical-align': 'text-bottom',
      },
    }),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,600,800',
        mono: 'DM Mono:400,600',
        condensed: 'Roboto Condensed',
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
