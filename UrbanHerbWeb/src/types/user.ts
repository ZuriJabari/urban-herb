export interface Address {
  id: string;
  street_address: string;
  city: string;
  district: string;
  phone_number: string;
  is_default: boolean;
  label?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  promotional_emails: boolean;
  newsletter: boolean;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
  preferences: UserPreferences;
}

export interface RegisterData {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  confirm_password: string;
}

export interface EmailLoginData {
  email: string;
  password: string;
}

export interface PhoneLoginData {
  phone_number: string;
}

export interface VerifyPhoneData {
  phone_number: string;
  code: string;
}

export interface PasswordResetRequestData {
  identifier: string; // email or phone number
}

export interface PasswordResetVerifyData {
  identifier: string;
  code: string;
}

export interface PasswordResetConfirmData {
  identifier: string;
  code: string;
  new_password: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType {
  state: AuthState;
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => Promise<void>;
  loginWithEmail: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}
