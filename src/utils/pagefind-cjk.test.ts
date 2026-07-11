import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildCjkQueryVariants,
  buildCjkSearchBoost,
} from './pagefind-cjk.ts'

describe('buildCjkSearchBoost', () => {
  it('为中文标题生成整词、单字与二元组', () => {
    const boost = buildCjkSearchBoost('马斯克最厉害的')
    assert.match(boost, /马斯克/)
    assert.match(boost, /马/)
    assert.match(boost, /斯克/)
    assert.match(boost, /马斯/)
  })

  it('合并标题与标签', () => {
    const boost = buildCjkSearchBoost('标题', ['标签甲', '标签乙'])
    assert.match(boost, /标签甲/)
    assert.match(boost, /标签乙/)
  })
})

describe('buildCjkQueryVariants', () => {
  it('为查询生成二元/三元组变体', () => {
    const variants = buildCjkQueryVariants('马斯克')
    assert.ok(variants.includes('马斯克'))
    assert.ok(variants.includes('马斯'))
    assert.ok(variants.includes('斯克'))
  })
})
