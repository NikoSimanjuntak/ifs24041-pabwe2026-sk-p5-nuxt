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
      let success = false
      try {
        this.profile = await updateMe(payload)
        success = true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isProfileUpdating = false
      }
      return success
    },
    async changePhoto(file: File): Promise<boolean> {
      this.isPhotoUploading = true
      let success = false
      try {
        await uploadPhoto(file)
        this.profile = await getMe()
        success = true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isPhotoUploading = false
      }
      return success
    },
    async changePassword(payload: ChangePasswordPayload): Promise<boolean> {
      this.isPasswordChanging = true
      let success = false
      try {
        await changePasswordRequest(payload)
        success = true
      } catch (error) {
        await showErrorDialog(getErrorMessage(error))
      } finally {
        this.isPasswordChanging = false
      }
      return success
    },
  },
})