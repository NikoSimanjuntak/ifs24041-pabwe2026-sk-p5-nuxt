import { beforeEach, describe, expect, it, vi } from 'vitest'
import { request } from '~/helpers/apiHelper'
import { mockUser } from '~/test-utils'
import { changePassword, getMe, getUsers, updateMe, uploadPhoto } from './userApi'

vi.mock('~/helpers/apiHelper', () => ({ request: vi.fn() }))

const requestMock = vi.mocked(request)
const ok = (data: unknown, message = 'ok') => ({ status: 'success', message, data }) as never

beforeEach(() => requestMock.mockReset())

describe('userApi', () => {
  it('getUsers memanggil GET /users', async () => {
    requestMock.mockResolvedValue(ok({ users: [mockUser] }))
    await expect(getUsers()).resolves.toEqual([mockUser])
    expect(requestMock).toHaveBeenCalledWith('/users')
  })

  it('getMe memanggil GET /users/me', async () => {
    requestMock.mockResolvedValue(ok({ user: mockUser }))
    await expect(getMe()).resolves.toEqual(mockUser)
    expect(requestMock).toHaveBeenCalledWith('/users/me')
  })

  it('updateMe memanggil PUT /users/me', async () => {
    requestMock.mockResolvedValue(ok({ user: mockUser }))
    const payload = { name: 'A', email: 'a@b.c' }
    await expect(updateMe(payload)).resolves.toEqual(mockUser)
    expect(requestMock).toHaveBeenCalledWith('/users/me', { method: 'PUT', body: payload })
  })

  it('uploadPhoto mengirim FormData ke POST /users/me/photo', async () => {
    requestMock.mockResolvedValue(ok(undefined, 'foto diubah'))
    const file = new File(['x'], 'foto.png', { type: 'image/png' })
    await expect(uploadPhoto(file)).resolves.toBe('foto diubah')
    const [path, options] = requestMock.mock.calls[0]
    expect(path).toBe('/users/me/photo')
    expect(options?.method).toBe('POST')
    expect((options?.body as FormData).get('photo')).toBe(file)
  })

  it('changePassword memanggil PUT /users/password', async () => {
    requestMock.mockResolvedValue(ok(undefined, 'sandi diubah'))
    const payload = { password: '1', new_password: '2', new_password_confirmation: '2' }
    await expect(changePassword(payload)).resolves.toBe('sandi diubah')
    expect(requestMock).toHaveBeenCalledWith('/users/password', { method: 'PUT', body: payload })
  })
})
