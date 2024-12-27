import { 
  PhoneAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  User
} from '@firebase/auth';
import { auth } from '../config/firebase';

export class AuthService {
  static async signInWithPhone(phoneNumber: string): Promise<string> {
    try {
      const provider = new PhoneAuthProvider(auth);
      const verificationId = await provider.verifyPhoneNumber(phoneNumber, window as any);
      return verificationId;
    } catch (error) {
      console.error('Error sending verification code:', error);
      throw error;
    }
  }

  static async verifyOTP(verificationId: string, otp: string): Promise<User> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      return userCredential.user;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  static async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  static getCurrentUser(): User | null {
    return auth.currentUser;
  }
}
