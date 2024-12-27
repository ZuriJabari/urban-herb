import axios from 'axios';
import { authApi } from '../api';
import { formatPhoneNumber } from '../api';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  defaults: { headers: { common: {} } },
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
}));

describe('Authentication API', () => {
  const mockAxios = axios.create();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phone Verification', () => {
    const testPhone = '+1234567890';
    const testCode = '123456';

    it('should send verification code for registration', async () => {
      const registerData = {
        phone_number: testPhone,
        first_name: 'John',
        last_name: 'Doe',
      };

      (mockAxios.post as jest.Mock).mockResolvedValueOnce({
        data: { message: 'Verification code sent' }
      });

      await authApi.register(registerData);

      expect(mockAxios.post).toHaveBeenCalledWith('/v1/auth/phone/send-verification/', {
        phone_number: formatPhoneNumber(testPhone),
        first_name: 'John',
        last_name: 'Doe',
        is_registration: true
      });
    });

    it('should send verification code for login', async () => {
      const loginData = {
        phone_number: testPhone
      };

      (mockAxios.post as jest.Mock).mockResolvedValueOnce({
        data: { message: 'Verification code sent' }
      });

      await authApi.loginWithPhone(loginData);

      expect(mockAxios.post).toHaveBeenCalledWith('/v1/auth/phone/send-verification/', {
        phone_number: formatPhoneNumber(testPhone),
        is_registration: false
      });
    });

    it('should verify phone number with code', async () => {
      const verifyData = {
        phone_number: testPhone,
        code: testCode
      };

      (mockAxios.post as jest.Mock).mockResolvedValueOnce({
        data: {
          access: 'access_token',
          refresh: 'refresh_token',
          user: {}
        }
      });

      await authApi.verifyPhone(verifyData);

      expect(mockAxios.post).toHaveBeenCalledWith('/v1/auth/phone/verify/', {
        phone_number: formatPhoneNumber(testPhone),
        code: testCode
      });
    });
  });
});
