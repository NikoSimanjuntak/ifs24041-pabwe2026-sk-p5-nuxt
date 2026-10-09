import { fireEvent, render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import AvatarComponent from './AvatarComponent.vue'

describe('AvatarComponent', () => {
  it('menampilkan inisial jika tidak ada foto', () => {
    render(AvatarComponent, { props: { name: 'ann', photo: null, sizeClass: 'size-10' } })
    expect(screen.getByTestId('avatar-initial')).toHaveTextContent('A')
  })

  it('menampilkan gambar jika foto tersedia', () => {
    render(AvatarComponent, { props: { name: 'Ann', photo: 'img/a.png', sizeClass: 'size-10' } })
    expect(screen.getByAltText('Foto Ann')).toHaveAttribute('src', 'https://open-api.delcom.org/img/a.png')
    expect(screen.queryByTestId('avatar-initial')).not.toBeInTheDocument()
  })

  it('kembali ke inisial saat gambar gagal dimuat', async () => {
    render(AvatarComponent, { props: { name: 'Ann', photo: 'http://127.0.0.1:8000/x.png', sizeClass: 'size-10' } })
    await fireEvent.error(screen.getByAltText('Foto Ann'))
    expect(screen.getByTestId('avatar-initial')).toHaveTextContent('A')
  })
})
