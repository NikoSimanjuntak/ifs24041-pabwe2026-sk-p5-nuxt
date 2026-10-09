import { request } from '~/helpers/apiHelper'

export interface AuthUser {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload extends LoginPayload {
  name: string
}

export interface LoginResult {
  user: AuthUser
  token: string
}

export const login = async (payload: LoginPayload): Promise<LoginResult> => {
  const response = await request<LoginResult>('/auth/login', { method: 'POST', body: payload, auth: false })
  return response.data
}

export const register = async (payload: RegisterPayload): Promise<string> => {
  const response = await request('/auth/register', { method: 'POST', body: payload, auth: false })
  return response.message
}

export const logout = async (): Promise<void> => {
  await request('/auth/logout', { method: 'POST' })
}
