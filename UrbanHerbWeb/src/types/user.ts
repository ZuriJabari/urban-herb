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
  sms_notifications: boolean;
  email_notifications: boolean;
  promotions_notifications: boolean;
  order_updates_notifications: boolean;
  language: 'en' | 'sw';
  currency: 'UGX' | 'USD';
}

export interface User {
  id: string;
  email?: string;
  phone_number?: string;
  first_name: string;
  last_name: string;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  addresses: Address[];
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  email?: string;
  phone_number?: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
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
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthContextType {
  state: AuthState;
  register: (data: RegisterData) => Promise<void>;
  loginWithEmail: (data: EmailLoginData) => Promise<void>;
  loginWithPhone: (data: PhoneLoginData) => Promise<void>;
  verifyPhone: (data: VerifyPhoneData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  requestPasswordReset: (data: PasswordResetRequestData) => Promise<void>;
  verifyPasswordReset: (data: PasswordResetVerifyData) => Promise<void>;
  confirmPasswordReset: (data: PasswordResetConfirmData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
}
