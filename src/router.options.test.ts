import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import routerOptions from './router.options'
import { routes } from './routes'

const createTestRouter = () => createRouter({ history: createMemoryHistory(), routes })

describe('router.options', () => {
  it('menyediakan rute dari src/routes.ts', () => {
    const provide = routerOptions.routes as unknown as (existing: unknown[]) => unknown
    expect(provide([])).toBe(routes)
  })

  it('mendaftarkan rute autentikasi', () => {
    const router = createTestRouter()
    expect(router.resolve('/auth/login').name).toBe('login')
    expect(router.resolve('/auth/register').name).toBe('register')
  })

  it('mendaftarkan rute dashboard terproteksi', () => {
    const router = createTestRouter()
    expect(router.resolve('/').name).toBe('home')
    expect(router.resolve('/cash-flows/7').name).toBe('cash-flow-detail')
    expect(router.resolve('/cash-flows/7').params.cashFlowId).toBe('7')
    expect(router.resolve('/users').name).toBe('users')
    expect(router.resolve('/profile').name).toBe('profile')
  })

  it('mengarahkan /auth ke halaman login', async () => {
    const router = createTestRouter()
    await router.push('/auth')
    expect(router.currentRoute.value.fullPath).toBe('/auth/login')
  })

  it('memakai halaman 404 untuk rute yang tidak dikenal', () => {
    const router = createTestRouter()
    expect(router.resolve('/tidak/ada').name).toBe('not-found')
  })
})
