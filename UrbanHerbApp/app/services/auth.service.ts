import auth from '@react-native-firebase/auth'
import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'

class AuthService {
  private static instance: AuthService
  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async signInWithPhoneNumber(phoneNumber: string): Promise<FirebaseAuthTypes.ConfirmationResult> {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber)
      return confirmation
    } catch (error) {
      console.error('Error during phone sign in:', error)
      throw error
    }
  }

  async verifyOTP(confirmation: FirebaseAuthTypes.ConfirmationResult, code: string): Promise<FirebaseAuthTypes.UserCredential> {
    try {
      const result = await confirmation.confirm(code)
      if (result.user) {
        await this.setUserSession(result.user.uid)
      }
      return result
    } catch (error) {
      console.error('Error during OTP verification:', error)
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await auth().signOut()
      await this.clearUserSession()
    } catch (error) {
      console.error('Error during logout:', error)
      throw error
    }
  }

  private async setUserSession(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem('userId', userId)
    } catch (error) {
      console.error('Error setting user session:', error)
      throw error
    }
  }

  private async clearUserSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem('userId')
    } catch (error) {
      console.error('Error clearing user session:', error)
      throw error
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const userId = await AsyncStorage.getItem('userId')
      return userId !== null
    } catch (error) {
      console.error('Error checking authentication status:', error)
      return false
    }
  }

  getCurrentUser(): FirebaseAuthTypes.User | null {
    return auth().currentUser
  }
}

export default AuthService.getInstance()
