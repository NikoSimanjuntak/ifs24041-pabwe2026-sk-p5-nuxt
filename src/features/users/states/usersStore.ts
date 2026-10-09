import { defineStore } from 'pinia'
import { getErrorMessage } from '~/helpers/apiHelper'
import { showErrorDialog } from '~/helpers/toolsHelper'
import {
  changePassword as changePasswordRequest,
  getMe,
  getUsers,
  updateMe,
  uploadPhoto,
  type ChangePasswordPayload,
  type UpdateProfilePayload,
  type User,
} from '../api/userApi'

export interface UsersState {
  users: User[]
  profile: User | null
  isUsersLoading: boolean
  isProfileLoading: boolean
  isProfileUpdating: boolean
  isPhotoUploading: boolean
  isPasswordChanging: boolean
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    profile: null,
    isUsersLoading: false,
    isProfileLoading: false,
    isProfileUpdating: false,
    isPhotoUploading: false,
    isPasswordChanging: false,
  }),
  actions: {
    async fetchUsers(): Promise<void> {
      this.isUsersLoading = true
      try {
        this.users = await getUsers()
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isUsersLoading = false
      }
    },
    async fetchProfile(): Promise<void> {
      this.isProfileLoading = true
      try {
        this.profile = await getMe()
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isProfileLoading = false
      }
    },
    async updateProfile(payload: UpdateProfilePayload): Promise<boolean> {
      this.isProfileUpdating = true
      try {
        this.profile = await updateMe(payload)
        return true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
        return false
      } finally {
        this.isProfileUpdating = false
      }
    },
    async changePhoto(file: File): Promise<boolean> {
      this.isPhotoUploading = true
      try {
        await uploadPhoto(file)
        this.profile = await getMe()
        return true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
        return false
      } finally {
        this.isPhotoUploading = false
      }
    },
    async changePassword(payload: ChangePasswordPayload): Promise<boolean> {
      this.isPasswordChanging = true
      try {
        await changePasswordRequest(payload)
        return true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
        return false
      } finally {
        this.isPasswordChanging = false
      }
    },
  },
})
