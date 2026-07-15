import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { sanitizeHtml } from './sanitize-html.ts'
import { resolveMinutesRead } from './reading-time.ts'
import { extractMarkdownHeadings } from './markdown-headings.ts'
import { httpUrlSchema } from './url-schema.ts'

describe('sanitizeHtml', () => {
  it('strips script and event handlers', () => {
    assert.equal(sanitizeHtml('<p>hi</p><script>alert(1)</script>'), '<p>hi</p>')
    assert.equal(sanitizeHtml('<img src=x onerror=alert(1)>'), '<img src="x">')
    assert.equal(sanitizeHtml('<a href="javascript:alert(1)">x</a>'), '<a>x</a>')
  })

  it('keeps safe markup', () => {
    assert.equal(
      sanitizeHtml('<a href="https://example.com">hi</a>'),
      '<a href="https://example.com">hi</a>'
    )
  })

  it('forces noopener noreferrer on target links', () => {
    assert.equal(
      sanitizeHtml('<a href="https://example.com" target="_blank">hi</a>'),
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">hi</a>'
    )
    assert.equal(
      sanitizeHtml(
        '<a href="https://example.com" target="_blank" rel="nofollow">hi</a>'
      ),
      '<a href="https://example.com" target="_blank" rel="nofollow noopener noreferrer">hi</a>'
    )
  })
})

describe('resolveMinutesRead', () => {
  it('respects explicit values and estimates from body', () => {
    assert.equal(resolveMinutesRead(0, 'word '.repeat(500)), 0)
    assert.equal(resolveMinutesRead(7, 'x'), 7)
    assert.equal(typeof resolveMinutesRead(undefined, 'word '.repeat(400)), 'number')
    assert.equal(resolveMinutesRead(undefined, undefined), undefined)
  })
})

describe('extractMarkdownHeadings', () => {
  it('extracts h2 with stable slugs and skips fenced code', () => {
    const body = [
      '# Title',
      '',
      '## Hello World',
      '',
      '```',
      '## Not A Heading',
      '```',
      '',
      '## Hello World',
      '',
      '### Nested',
    ].join('\n')

    const h2 = extractMarkdownHeadings(body, 2)
    assert.deepEqual(
      h2.map((h) => h.slug),
      ['hello-world', 'hello-world-1']
    )
    assert.equal(extractMarkdownHeadings(body).length, 4)
  })
})

describe('httpUrlSchema', () => {
  it('accepts http(s) and rejects javascript:', () => {
    assert.equal(httpUrlSchema.safeParse('https://foo-z.com/').success, true)
    assert.equal(httpUrlSchema.safeParse('http://example.com').success, true)
    assert.equal(
      httpUrlSchema.safeParse('javascript:alert(1)').success,
      false
    )
  })
})
