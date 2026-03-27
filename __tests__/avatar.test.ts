import { describe, it, expect } from 'vitest'
import { getAvatarUrl } from '@/lib/personas/avatar'

describe('getAvatarUrl', () => {
  it('returns a randomuser.me URL', () => {
    const url = getAvatarUrl('Riya', 'female')
    expect(url).toMatch(/^https:\/\/randomuser\.me\/api\/portraits\//)
  })

  it('returns consistent URL for same name', () => {
    const url1 = getAvatarUrl('Riya', 'female')
    const url2 = getAvatarUrl('Riya', 'female')
    expect(url1).toBe(url2)
  })

  it('returns different URLs for different names', () => {
    const url1 = getAvatarUrl('Riya', 'female')
    const url2 = getAvatarUrl('James', 'male')
    expect(url1).not.toBe(url2)
  })

  it('portrait number is between 1 and 99', () => {
    const url = getAvatarUrl('Amara', 'female')
    const match = url.match(/\/(\d+)\.jpg$/)
    expect(match).not.toBeNull()
    const num = parseInt(match![1])
    expect(num).toBeGreaterThanOrEqual(1)
    expect(num).toBeLessThanOrEqual(99)
  })
})
