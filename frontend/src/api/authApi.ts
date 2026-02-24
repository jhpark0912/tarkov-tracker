import axiosInstance from './axiosInstance';
import type { AuthResponse, LoginRequest, SignupRequest, User } from '../types/auth';

export const authApi = {
  signup: (data: SignupRequest) =>
    axiosInstance.post<AuthResponse>('/auth/signup', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    axiosInstance.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  getMe: () =>
    axiosInstance.get<User>('/auth/me').then((r) => r.data),
};
