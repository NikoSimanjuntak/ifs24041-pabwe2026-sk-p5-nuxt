import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { renderWithProviders, textStub } from '~/test-utils'
import App from './app.vue'

describe('App', () => {
  it('me-render halaman sesuai rute aktif', async () => {
    await renderWithProviders(App, { route: '/', routes: [{ path: '/', component: textStub('halaman beranda') }] })
    expect(screen.getByText('halaman beranda')).toBeInTheDocument()
  })
})
