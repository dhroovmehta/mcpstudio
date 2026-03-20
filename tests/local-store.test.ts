import { describe, it, expect, beforeEach } from 'vitest'
import { localServers, localTools } from '@/lib/local-store'

describe('local-store', () => {
  beforeEach(() => {
    localServers.length = 0
    localTools.length = 0
  })

  it('starts with empty arrays', () => {
    expect(localServers).toEqual([])
    expect(localTools).toEqual([])
  })

  it('allows pushing servers', () => {
    localServers.push({ id: '1', name: 'Test' })
    expect(localServers).toHaveLength(1)
    expect(localServers[0].name).toBe('Test')
  })

  it('allows pushing tools', () => {
    localTools.push({ id: '1', name: 'get_weather', server_id: 'srv-1' })
    expect(localTools).toHaveLength(1)
    expect(localTools[0].name).toBe('get_weather')
  })

  it('allows filtering tools by server_id', () => {
    localTools.push({ id: '1', name: 'tool_a', server_id: 'srv-1' })
    localTools.push({ id: '2', name: 'tool_b', server_id: 'srv-2' })
    localTools.push({ id: '3', name: 'tool_c', server_id: 'srv-1' })

    const srv1Tools = localTools.filter((t) => t.server_id === 'srv-1')
    expect(srv1Tools).toHaveLength(2)
  })

  it('allows deletion by index', () => {
    localServers.push({ id: '1' }, { id: '2' }, { id: '3' })
    const idx = localServers.findIndex((s) => s.id === '2')
    localServers.splice(idx, 1)
    expect(localServers).toHaveLength(2)
    expect(localServers.find((s) => s.id === '2')).toBeUndefined()
  })
})
