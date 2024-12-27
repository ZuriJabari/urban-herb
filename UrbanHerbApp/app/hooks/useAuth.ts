import { useState, useCallback } from 'react'
import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import authService from '../services/auth.service'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null)

  const signInWithPhone = useCallback(async (phoneNumber: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await authService.signInWithPhoneNumber(phoneNumber)
      setConfirmation(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyOTP = useCallback(async (code: string) => {
    if (!confirmation) {
      setError('No confirmation available')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await authService.verifyOTP(confirmation, code)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [confirmation])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await authService.logout()
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const checkAuth = useCallback(async () => {
    try {
      return await authService.isAuthenticated()
    } catch (err) {
      setError(err.message)
      return false
    }
  }, [])

  return {
    loading,
    error,
    signInWithPhone,
    verifyOTP,
    logout,
    checkAuth,
    currentUser: authService.getCurrentUser(),
  }
}
