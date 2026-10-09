import { fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { Blank, renderWithProviders } from '~/test-utils'
import SidebarComponent from './SidebarComponent.vue'

const routes = [
  { path: '/', component: Blank },
  { path: '/users', component: Blank },
  { path: '/profile', component: Blank },
]

describe('SidebarComponent', () => {
  it('menampilkan menu navigasi', async () => {
    await renderWithProviders(SidebarComponent, { props: { open: false }, routes })
    expect(screen.getByRole('link', { name: 'Ringkasan Arus Kas' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Direktori Pengguna' })).toHaveAttribute('href', '/users')
    expect(screen.getByRole('link', { name: 'Profil Saya' })).toHaveAttribute('href', '/profile')
    expect(screen.queryByTestId('sidebar-backdrop')).not.toBeInTheDocument()
    expect(screen.getByRole('complementary')).toHaveClass('-translate-x-full')
  })

  it('menampilkan backdrop saat terbuka dan menutup lewat backdrop', async () => {
    const { emitted } = await renderWithProviders(SidebarComponent, { props: { open: true }, routes })
    expect(screen.getByRole('complementary')).toHaveClass('translate-x-0')
    await fireEvent.click(screen.getByTestId('sidebar-backdrop'))
    expect(emitted().close).toHaveLength(1)
  })

  it('menutup lewat tombol tutup dan saat menu dipilih', async () => {
    const { emitted, router } = await renderWithProviders(SidebarComponent, { props: { open: true }, routes })
    await fireEvent.click(screen.getByRole('button', { name: 'Tutup menu' }))
    await fireEvent.click(screen.getByRole('link', { name: 'Profil Saya' }))
    expect(emitted().close).toHaveLength(2)
    await router.isReady()
  })
})
