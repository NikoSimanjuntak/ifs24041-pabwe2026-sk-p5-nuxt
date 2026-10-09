import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  buildUrl,
  getAccessToken,
  getErrorMessage,
  putAccessToken,
  removeAccessToken,
  request,
} from './apiHelper'

const BASE = 'https://open-api.delcom.org/api/v1'
const fetchMock = vi.fn()

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('token helpers', () => {
  it('menyimpan, membaca, dan menghapus access token', () => {
    expect(getAccessToken()).toBeNull()
    putAccessToken('abc')
    expect(getAccessToken()).toBe('abc')
    removeAccessToken()
    expect(getAccessToken()).toBeNull()
  })
})

describe('buildUrl', () => {
  it('menggabungkan base url dan path tanpa parameter', () => {
    expect(buildUrl('/cash-flows')).toBe(`${BASE}/cash-flows`)
  })

  it('mengabaikan parameter kosong dan menyertakan yang terisi', () => {
    const url = buildUrl('/cash-flows', { type: 'inflow', label: '', a: undefined, b: null, total_data: 7 })
    expect(url).toBe(`${BASE}/cash-flows?type=inflow&total_data=7`)
  })
})

describe('request', () => {
  it('mengirim GET tanpa token', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success', message: 'ok', data: { a: 1 } }))
    const result = await request<{ a: number }>('/x')
    expect(result.data.a).toBe(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/x`)
    expect(init.method).toBe('GET')
    expect(init.headers).toEqual({ Accept: 'application/json' })
    expect(init.body).toBeUndefined()
  })

  it('menyertakan Bearer Token jika tersedia', async () => {
    putAccessToken('tok')
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success', message: 'ok', data: null }))
    await request('/x')
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok')
  })

  it('tidak menyertakan token ketika auth=false', async () => {
    putAccessToken('tok')
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success', message: 'ok', data: null }))
    await request('/x', { auth: false })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
  })

  it('mengirim body JSON dan query params', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success', message: 'ok', data: null }))
    await request('/x', { method: 'POST', body: { a: 1 }, params: { q: 'z' } })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe(`${BASE}/x?q=z`)
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe('{"a":1}')
  })

  it('mengirim FormData apa adanya tanpa Content-Type manual', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'success', message: 'ok', data: null }))
    const form = new FormData()
    form.append('photo', new File(['x'], 'p.png'))
    await request('/x', { method: 'POST', body: form })
    const init = fetchMock.mock.calls[0][1]
    expect(init.body).toBe(form)
    expect(init.headers['Content-Type']).toBeUndefined()
  })

  it('melempar ApiError saat jaringan gagal', async () => {
    fetchMock.mockRejectedValue(new TypeError('network'))
    const error = await request('/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).message).toContain('Tidak dapat terhubung')
    expect((error as ApiError).statusCode).toBeNull()
  })

  it('melempar ApiError saat respons bukan JSON', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 502 }))
    const error = (await request('/x').catch((e: unknown) => e)) as ApiError
    expect(error.message).toBe('Respons server tidak valid.')
    expect(error.statusCode).toBe(502)
  })

  it('melempar ApiError berisi pesan & data saat status fail', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'fail', message: 'Data tidak valid', data: { nama: ['wajib'] } }, 422))
    const error = (await request('/x').catch((e: unknown) => e)) as ApiError
    expect(error.name).toBe('ApiError')
    expect(error.message).toBe('Data tidak valid')
    expect(error.data).toEqual({ nama: ['wajib'] })
    expect(error.statusCode).toBe(422)
  })

  it('melempar ApiError walaupun HTTP 200 tetapi status bukan success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'fail', message: 'Gagal', data: null }, 200))
    await expect(request('/x')).rejects.toThrow('Gagal')
  })

  it('memakai pesan bawaan jika server tidak mengirim pesan', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'error' }, 500))
    await expect(request('/x')).rejects.toThrow('Terjadi kesalahan pada server.')
  })
})

describe('getErrorMessage', () => {
  it('menangani error non-ApiError', () => {
    expect(getErrorMessage(new Error('x'))).toBe('Terjadi kesalahan yang tidak diketahui.')
  })

  it('mengembalikan pesan saja jika tidak ada data', () => {
    expect(getErrorMessage(new ApiError('Gagal', null, 400))).toBe('Gagal')
  })

  it('mengabaikan data yang bukan object', () => {
    expect(getErrorMessage(new ApiError('Gagal', 'teks', 400))).toBe('Gagal')
  })

  it('mengabaikan object kosong', () => {
    expect(getErrorMessage(new ApiError('Gagal', {}, 400))).toBe('Gagal')
  })

  it('menggabungkan pesan validasi dari API', () => {
    const error = new ApiError('Data tidak valid', { email: ['Email wajib diisi', 'Format salah'] }, 422)
    expect(getErrorMessage(error)).toBe('Data tidak valid: Email wajib diisi Format salah')
  })
})
