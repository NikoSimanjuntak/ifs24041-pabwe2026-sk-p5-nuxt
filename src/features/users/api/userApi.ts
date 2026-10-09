import { request } from '~/helpers/apiHelper'

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  photo: string | null
  created_at: string
  updated_at: string
}

export interface UpdateProfilePayload {
  name: string
  email: string
}

export interface ChangePasswordPayload {
  password: string
  new_password: string
  new_password_confirmation: string
}

export const getUsers = async (): Promise<User[]> => {
  const response = await request<{ users: User[] }>('/users')
  return response.data.users
}

export const getMe = async (): Promise<User> => {
  const response = await request<{ user: User }>('/users/me')
  return response.data.user
}

export const updateMe = async (payload: UpdateProfilePayload): Promise<User> => {
  const response = await request<{ user: User }>('/users/me', { method: 'PUT', body: payload })
  return response.data.user
}

export const uploadPhoto = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append('photo', file)
  const response = await request('/users/me/photo', { method: 'POST', body: formData })
  return response.message
}

// Sesuai dokumentasi Delcom Open API: PUT /users/password
export const changePassword = async (payload: ChangePasswordPayload): Promise<string> => {
  const response = await request('/users/password', { method: 'PUT', body: payload })
  return response.message
}
