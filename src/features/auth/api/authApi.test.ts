import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from '~/helpers/apiHelper'
import { login, logout, register } from './authApi'

vi.mock('~/helpers/apiHelper', () => ({ request: vi.fn() }))

const requestMock = vi.mocked(request)

beforeEach(() => requestMock.mockReset())

describe('authApi', () => {
  it('login memanggil POST /auth/login tanpa token dan mengembalikan data', async () => {
    const data = { token: 't', user: { id: 1 } }
    requestMock.mockResolvedValue({ status: 'success', message: 'ok', data } as never)
    const payload = { email: 'a@b.c', password: '123456' }
    await expect(login(payload)).resolves.toEqual(data)
    expect(requestMock).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: payload, auth: false })
  })

  it('register memanggil POST /auth/register dan mengembalikan pesan', async () => {
    requestMock.mockResolvedValue({ status: 'success', message: 'Berhasil melakukan pendaftaran', data: undefined })
    const payload = { name: 'A', email: 'a@b.c', password: '123456' }
    await expect(register(payload)).resolves.toBe('Berhasil melakukan pendaftaran')
    expect(requestMock).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: payload, auth: false })
  })

  it('logout memanggil POST /auth/logout', async () => {
    requestMock.mockResolvedValue({ status: 'success', message: 'ok', data: undefined })
    await expect(logout()).resolves.toBeUndefined()
    expect(requestMock).toHaveBeenCalledWith('/auth/logout', { method: 'POST' })
  })
})
