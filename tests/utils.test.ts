import { describe, it, expect } from 'vitest'
import { cn, formatDate, truncate, slugify, resolvePath } from '@/lib/utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('filters falsy values', () => {
    expect(cn('foo', '', 'bar')).toBe('foo bar')
  })

  it('returns empty string for no truthy inputs', () => {
    expect(cn('', '')).toBe('')
  })
})

describe('formatDate', () => {
  it('formats a date string', () => {
    const result = formatDate('2024-01-15T12:00:00Z')
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })

  it('formats a Date object', () => {
    const result = formatDate(new Date('2024-06-01'))
    expect(result).toContain('2024')
  })
})

describe('truncate', () => {
  it('returns string as-is when short enough', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('Hello! @World#')).toBe('hello-world')
  })

  it('trims leading/trailing hyphens', () => {
    expect(slugify('--hello--')).toBe('hello')
  })

  it('lowercases', () => {
    expect(slugify('UPPER')).toBe('upper')
  })
})

describe('resolvePath', () => {
  it('resolves a simple path', () => {
    expect(resolvePath({ foo: 'bar' }, 'foo')).toBe('bar')
  })

  it('resolves a nested path', () => {
    expect(resolvePath({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
  })

  it('returns undefined for missing path', () => {
    expect(resolvePath({ a: 1 }, 'b')).toBeUndefined()
  })

  it('returns undefined for deep missing path', () => {
    expect(resolvePath({ a: { b: 1 } }, 'a.c.d')).toBeUndefined()
  })

  it('handles null/undefined input', () => {
    expect(resolvePath(null, 'a')).toBeUndefined()
    expect(resolvePath(undefined, 'a')).toBeUndefined()
  })
})
