import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text } from 'app/components/Text'
import PhoneInput from 'react-native-phone-number-input'
import { useAuth } from '../../hooks/useAuth'
import { colors, spacing } from '../../theme'
import { Button } from '../Button'

export const PhoneAuthScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showOTPInput, setShowOTPInput] = useState(false)
  const { loading, error, signInWithPhone, verifyOTP } = useAuth()

  const handleSendCode = async () => {
    try {
      await signInWithPhone(phoneNumber)
      setShowOTPInput(true)
    } catch (err) {
      console.error('Error sending code:', err)
    }
  }

  const handleVerifyCode = async () => {
    try {
      await verifyOTP(verificationCode)
    } catch (err) {
      console.error('Error verifying code:', err)
    }
  }

  return (
    <View style={styles.container}>
      <Text preset="heading" text="Welcome to UrbanHerb" style={styles.title} />
      
      {!showOTPInput ? (
        <>
          <Text preset="subheading" text="Enter your phone number" style={styles.subtitle} />
          <PhoneInput
            defaultCode="UG"
            layout="first"
            onChangeFormattedText={setPhoneNumber}
            withDarkTheme
            containerStyle={styles.phoneInput}
          />
          <Button
            text="Send Verification Code"
            onPress={handleSendCode}
            style={styles.button}
            disabled={loading || !phoneNumber}
          />
        </>
      ) : (
        <>
          <Text preset="subheading" text="Enter verification code" style={styles.subtitle} />
          <View style={styles.otpContainer}>
            <TextInput
              style={styles.otpInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="number-pad"
              maxLength={6}
              placeholder="Enter 6-digit code"
            />
          </View>
          <Button
            text="Verify Code"
            onPress={handleVerifyCode}
            style={styles.button}
            disabled={loading || verificationCode.length !== 6}
          />
        </>
      )}

      {loading && <ActivityIndicator size="large" color={colors.primary} />}
      {error && <Text style={styles.error} text={error} />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  title: {
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  phoneInput: {
    width: '100%',
    marginBottom: spacing.medium,
  },
  button: {
    marginTop: spacing.medium,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  otpInput: {
    width: '60%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.medium,
    fontSize: 18,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.small,
  },
})
