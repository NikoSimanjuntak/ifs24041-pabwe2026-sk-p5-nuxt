import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '~/test-utils'
import NotFoundPage from './NotFoundPage.vue'

describe('NotFoundPage', () => {
  it('menampilkan pesan 404 dan tautan kembali', async () => {
    await renderWithProviders(NotFoundPage, { routes: [{ path: '/:pathMatch(.*)*', component: NotFoundPage }] })
    expect(screen.getByRole('heading', { name: 'Halaman tidak ditemukan' })).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Kembali ke Beranda' })).toHaveAttribute('href', '/')
  })
})
