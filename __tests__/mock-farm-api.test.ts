import { mockFarmApi } from '@/lib/mock-farm-api'
import { initialState } from '@/lib/seed-data'

describe('mock farm API', () => {
  afterEach(async () => {
    await mockFarmApi.save(initialState)
  })

  it('loads an isolated copy of the seed data', async () => {
    const state = await mockFarmApi.load()
    state.projects[0].name = '変更'

    const reloaded = await mockFarmApi.load()
    expect(reloaded.projects[0].name).toBe(initialState.projects[0].name)
  })

  it('serves saved state to subsequent requests', async () => {
    const state = await mockFarmApi.load()
    state.projects[0].name = 'ローカル更新'
    await mockFarmApi.save(state)

    expect((await mockFarmApi.load()).projects[0].name).toBe('ローカル更新')
  })
})
