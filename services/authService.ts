import { apiClient } from './apiClient';
import { User } from '../types';

interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  login: (email: string, password: string): Promise<LoginResponse> => {
    return apiClient<LoginResponse>('/auth/login', {
      method: 'POST',
      data: { email, password },
      isAuthRequest: true,
      noAuth: true,
    });
  },
  logout: (): Promise<void> => {
    return apiClient<void>('/auth/logout', {
      method: 'POST',
      isAuthRequest: true
    });
  },
};