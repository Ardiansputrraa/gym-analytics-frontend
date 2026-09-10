import { apiClient } from '@/lib/api-client';

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  otp: string;
}

export interface ResendOtpDto {
  email: string;
  type?: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
}

export interface GoogleAuthDto {
  idToken?: string;
  credential?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  phone?: string;
}

export interface LogoutDto {
  refreshToken?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  isAdmin: boolean;
  isEmailVerified?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  name: string;
  phone?: string | null;
  isEmailVerified: boolean;
  message: string;
}

export interface GenericMessageResponse {
  userId?: string;
  email?: string;
  message: string;
  success?: boolean;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code?: string;
  otp?: string;
  newPassword: string;
}

export const authService = {
  register: async (data: RegisterDto): Promise<RegisterResponse> => {
    return apiClient.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword || data.password,
      phone: data.phone || undefined,
    });
  },

  login: async (data: LoginDto): Promise<AuthResponse> => {
    return apiClient.post('/auth/login', data);
  },

  googleAuth: async (data: GoogleAuthDto): Promise<AuthResponse> => {
    return apiClient.post('/auth/google', data);
  },

  logout: async (data?: LogoutDto): Promise<GenericMessageResponse> => {
    return apiClient.post('/auth/logout', data || {});
  },

  verifyEmail: async (data: VerifyEmailDto): Promise<GenericMessageResponse> => {
    return apiClient.post('/auth/verify-email', {
      email: data.email,
      otp: data.otp,
    });
  },

  resendOtp: async (data: ResendOtpDto): Promise<GenericMessageResponse> => {
    return apiClient.post('/auth/resend-otp', {
      email: data.email,
      type: data.type || 'EMAIL_VERIFICATION',
    });
  },

  forgotPassword: async (data: ForgotPasswordDto): Promise<GenericMessageResponse> => {
    return apiClient.post('/auth/resend-otp', {
      email: data.email,
      type: 'PASSWORD_RESET',
    });
  },

  resetPassword: async (data: ResetPasswordDto): Promise<GenericMessageResponse> => {
    return apiClient.post('/auth/reset-password', {
      email: data.email,
      otp: data.otp || data.code,
      newPassword: data.newPassword,
    });
  },
};
