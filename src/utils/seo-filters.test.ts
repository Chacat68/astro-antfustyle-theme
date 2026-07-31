import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isEnglishChangelogFallback,
  isMissingEnglishBlogTranslation,
  shouldIncludeRouteInSitemap,
} from './seo-filters.ts'

describe('isEnglishChangelogFallback', () => {
  it('识别英文 changelog 列表与详情', () => {
    assert.equal(isEnglishChangelogFallback('/en/changelog/'), true)
    assert.equal(isEnglishChangelogFallback('/en/changelog/130/'), true)
  })

  it('不误伤中文 changelog 与其它英文路由', () => {
    assert.equal(isEnglishChangelogFallback('/changelog/'), false)
    assert.equal(isEnglishChangelogFallback('/changelog/130/'), false)
    assert.equal(isEnglishChangelogFallback('/en/blog/ai1/'), false)
  })
})

describe('shouldIncludeRouteInSitemap', () => {
  const englishBlogIds = new Set(['ai1'])

  it('排除英文 changelog fallback', () => {
    assert.equal(
      shouldIncludeRouteInSitemap('/en/changelog/', englishBlogIds),
      false
    )
    assert.equal(
      shouldIncludeRouteInSitemap('/en/changelog/130/', englishBlogIds),
      false
    )
  })

  it('保留中文 changelog 与有翻译的英文博客', () => {
    assert.equal(
      shouldIncludeRouteInSitemap('/changelog/', englishBlogIds),
      true
    )
    assert.equal(
      shouldIncludeRouteInSitemap('/en/blog/ai1/', englishBlogIds),
      true
    )
  })

  it('排除无英文翻译的博客路由', () => {
    assert.equal(
      isMissingEnglishBlogTranslation('/en/blog/missing/', englishBlogIds),
      true
    )
    assert.equal(
      shouldIncludeRouteInSitemap('/en/blog/missing/', englishBlogIds),
      false
    )
  })

  it('排除 noindex 路由', () => {
    assert.equal(shouldIncludeRouteInSitemap('/shorts/', englishBlogIds), false)
    assert.equal(
      shouldIncludeRouteInSitemap('/en/shorts/', englishBlogIds),
      false
    )
  })
})
