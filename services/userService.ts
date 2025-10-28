
import { apiClient } from './apiClient';
import { User } from '../types';

interface GetAllUsersResponse {
    items: User[];
    // Include other pagination properties if the API provides them
}

type UserUpdatePayload = Partial<Pick<User, 'fullname' | 'role' | 'isActive'>>;

export const userService = {
  getAll: (signal?: AbortSignal): Promise<GetAllUsersResponse> => {
    return apiClient<GetAllUsersResponse>('/users', { signal });
  },
  getById: (id: number, signal?: AbortSignal): Promise<User> => {
    return apiClient<User>(`/users/${id}`, { signal });
  },
  update: (id: number, data: UserUpdatePayload): Promise<User> => {
    return apiClient<User>(`/users/${id}`, {
      method: 'PUT',
      data,
    });
  },
  activate: (id: number): Promise<void> => {
    return apiClient<void>(`/users/${id}/activate`, {
      method: 'POST',
    });
  },
  getPartnerRequests: (signal?: AbortSignal): Promise<GetAllUsersResponse> => {
    return apiClient<GetAllUsersResponse>('/users/partner-requests', { signal });
  },
  approvePartner: (id: number): Promise<void> => {
    return apiClient<void>(`/users/${id}/approve-partner`, {
      method: 'POST',
    });
  },
  declinePartner: (id: number): Promise<void> => {
    return apiClient<void>(`/users/${id}/decline-partner`, {
      method: 'POST',
    });
  },
};
