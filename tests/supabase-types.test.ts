import { describe, it, expect } from 'vitest'
import { TIER_LIMITS } from '@/lib/supabase'

describe('TIER_LIMITS', () => {
  it('defines free tier limits', () => {
    expect(TIER_LIMITS.free.maxServers).toBe(3)
    expect(TIER_LIMITS.free.maxCallsPerDay).toBe(100)
  })

  it('defines professional tier with unlimited servers', () => {
    expect(TIER_LIMITS.professional.maxServers).toBe(Infinity)
    expect(TIER_LIMITS.professional.maxCallsPerDay).toBe(10000)
  })

  it('defines enterprise tier with unlimited servers', () => {
    expect(TIER_LIMITS.enterprise.maxServers).toBe(Infinity)
    expect(TIER_LIMITS.enterprise.maxCallsPerDay).toBe(100000)
  })

  it('has escalating call limits across tiers', () => {
    expect(TIER_LIMITS.professional.maxCallsPerDay).toBeGreaterThan(TIER_LIMITS.free.maxCallsPerDay)
    expect(TIER_LIMITS.enterprise.maxCallsPerDay).toBeGreaterThan(TIER_LIMITS.professional.maxCallsPerDay)
  })

  it('free tier has finite server limit', () => {
    expect(Number.isFinite(TIER_LIMITS.free.maxServers)).toBe(true)
  })

  it('paid tiers have unlimited servers', () => {
    expect(Number.isFinite(TIER_LIMITS.professional.maxServers)).toBe(false)
    expect(Number.isFinite(TIER_LIMITS.enterprise.maxServers)).toBe(false)
  })
})
