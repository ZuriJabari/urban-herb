export interface Address {
  id: string;
  userId: string;
  streetAddress: string;
  city: string;
  district: string;
  phoneNumber: string;
  isDefault: boolean;
  label?: string;
}

export interface UserPreferences {
  notifications: {
    sms: boolean;
    email: boolean;
    promotions: boolean;
    orderUpdates: boolean;
  };
  language: string;
  currency: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  addresses: Address[];
  preferences?: UserPreferences;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface PhoneAuthPayload {
  phoneNumber: string;
}

export interface EmailAuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Mock data for testing
export const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+256700000000',
    email: 'john@example.com',
    isPhoneVerified: true,
    isEmailVerified: true,
    addresses: [],
    preferences: {
      notifications: {
        sms: true,
        email: true,
        promotions: true,
        orderUpdates: true,
      },
      language: 'en',
      currency: 'UGX',
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];
