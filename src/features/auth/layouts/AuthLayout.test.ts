import { flushPromises } from '@vue/test-utils'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { putAccessToken } from '~/helpers/apiHelper'
import { Blank, renderWithProviders, RouterRoot, textStub } from '~/test-utils'
import AuthLayout from './AuthLayout.vue'

const routes = [
  { path: '/auth', component: AuthLayout, children: [{ path: 'login', component: textStub('isi login') }] },
  { path: '/', component: Blank },
]

describe('AuthLayout', () => {
  it('menampilkan shell autentikasi dan konten rute anak', async () => {
    const { router } = await renderWithProviders(RouterRoot, { route: '/auth/login', routes })
    expect(screen.getByText('isi login')).toBeInTheDocument()
    expect(screen.getAllByText('Delcom Cash Flow')).toHaveLength(2)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Catat setiap rupiah')
    expect(router.currentRoute.value.fullPath).toBe('/auth/login')
  })

  it('mengarahkan pengguna yang sudah login ke beranda', async () => {
    putAccessToken('tok')
    const { router } = await renderWithProviders(RouterRoot, { route: '/auth/login', routes })
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/')
  })
})
