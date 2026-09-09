import { apiClient } from '@/lib/api-client';

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResendOtpDto {
  email: string;
  type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}

export const authService = {
  register: async (data: RegisterDto) => {
    return apiClient.post('/auth/register', data);
  },

  login: async (data: LoginDto) => {
    return apiClient.post('/auth/login', data);
  },

  verifyEmail: async (data: VerifyEmailDto) => {
    return apiClient.post('/auth/verify-email', data);
  },

  resendOtp: async (data: ResendOtpDto) => {
    return apiClient.post('/auth/resend-otp', data);
  },

  forgotPassword: async (data: ForgotPasswordDto) => {
    return apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordDto) => {
    return apiClient.post('/auth/reset-password', data);
  },
};
