import { apiClient } from './apiClient';
import { User } from '../types';

const USER_API_BASE = 'https://mumii-auth.onrender.com/api';

interface GetAllUsersResponse {
    items: User[];
    // Include other pagination properties if the API provides them
}

type UserUpdatePayload = Partial<Pick<User, 'fullname' | 'role' | 'isActive'>>;

export const userService = {
  getAll: (signal?: AbortSignal): Promise<GetAllUsersResponse> => {
    return apiClient<GetAllUsersResponse>('/admin/users', { signal, baseUrlOverride: USER_API_BASE });
  },
  getById: (id: number, signal?: AbortSignal): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}`, { signal, baseUrlOverride: USER_API_BASE });
  },
  update: (id: number, data: UserUpdatePayload): Promise<User> => {
    return apiClient<User>(`/admin/users/${id}`, {
      method: 'PUT',
      data,
      baseUrlOverride: USER_API_BASE,
    });
  },
  activate: (id: number): Promise<void> => {
    return apiClient<void>(`/admin/users/${id}/activate`, {
      method: 'POST',
      baseUrlOverride: USER_API_BASE,
    });
  },
  getPartnerRequests: (signal?: AbortSignal): Promise<GetAllUsersResponse> => {
    return apiClient<GetAllUsersResponse>('/admin/users/partner-requests', { signal, baseUrlOverride: USER_API_BASE });
  },
  approvePartner: (id: number): Promise<void> => {
    return apiClient<void>(`/admin/users/${id}/approve-partner`, {
      method: 'POST',
      baseUrlOverride: USER_API_BASE,
    });
  },
  declinePartner: (id: number): Promise<void> => {
    return apiClient<void>(`/admin/users/${id}/decline-partner`, {
      method: 'POST',
      baseUrlOverride: USER_API_BASE,
    });
  },
};