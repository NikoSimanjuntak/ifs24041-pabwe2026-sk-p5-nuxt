const ACCESS_TOKEN_KEY = 'delcom_access_token'

export type ApiStatus = 'success' | 'fail' | 'error'

export interface ApiResponse<T = undefined> {
  status: ApiStatus
  message: string
  data: T
}

export type QueryParams = Record<string, string | number | null | undefined>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  params?: QueryParams
  /** Sertakan header Bearer Token jika token tersedia (default: true). */
  auth?: boolean
}

export class ApiError extends Error {
  readonly data: unknown
  readonly statusCode: number | null

  constructor(message: string, data: unknown, statusCode: number | null) {
    super(message)
    this.name = 'ApiError'
    this.data = data
    this.statusCode = statusCode
  }
}

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY)

export const putAccessToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const removeAccessToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const buildUrl = (path: string, params?: QueryParams): string => {
  const url = new URL(`${DELCOM_BASEURL}${path}`)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

/** Mengubah error menjadi pesan yang ramah pengguna (termasuk pesan validasi dari API). */
export const getErrorMessage = (error: unknown): string => {
  if (!(error instanceof ApiError)) {
    return 'Terjadi kesalahan yang tidak diketahui.'
  }
  const data = error.data as Record<string, unknown> | null | undefined
  const details = data && typeof data === 'object' ? Object.values(data).flat().join(' ') : ''
  return details ? `${error.message}: ${details}` : error.message
}

/** Wrapper fetch untuk Delcom Open API. Melempar ApiError jika request gagal. */
export async function request<T = undefined>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, params, auth = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = getAccessToken()

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`
  }

  let payload: BodyInit | undefined
  if (body instanceof FormData) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), { method, headers, body: payload })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.', null, null)
  }

  let json: ApiResponse<T>
  try {
    json = (await response.json()) as ApiResponse<T>
  } catch {
    throw new ApiError('Respons server tidak valid.', null, response.status)
  }

  if (!response.ok || json.status !== 'success') {
    throw new ApiError(json.message || 'Terjadi kesalahan pada server.', json.data, response.status)
  }

  return json
}
