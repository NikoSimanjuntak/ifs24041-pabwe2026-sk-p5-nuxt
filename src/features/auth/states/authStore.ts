import { defineStore } from 'pinia'
import { getAccessToken, getErrorMessage, putAccessToken, removeAccessToken } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
import {
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '../api/authApi'

export interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: getAccessToken(),
    user: null,
    isAuthLoading: false,
  }),
  getters: {
    isAuthenticated: (state): boolean => state.token !== null,
  },
  actions: {
    async login(payload: LoginPayload): Promise<boolean> {
      this.isAuthLoading = true
      let success = false
      try {
        const result = await loginRequest(payload)
        putAccessToken(result.token)
        this.token = result.token
        this.user = result.user
        success = true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isAuthLoading = false
      }
      return success
    },
    async register(payload: RegisterPayload): Promise<boolean> {
      this.isAuthLoading = true
      let success = false
      try {
        await registerRequest(payload)
        success = true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isAuthLoading = false
      }
      return success
    },
    async logout(): Promise<void> {
      try {
        await logoutRequest()
      } catch {
        // Token tetap dihapus di sisi klien walaupun server tidak dapat dihubungi.
      }
      removeAccessToken()
      this.token = null
      this.user = null
    },
  },
})