import { apiClient } from './apiClient';
import { Notification } from '../types';

interface GetAllNotificationsParams {
    page: number;
    pageSize: number;
    userId?: string;
    isRead?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: keyof Notification;
    sortDirection?: 'asc' | 'desc';
}

interface GetAllNotificationsResponse {
    items: Notification[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

interface SendNotificationPayload {
    userId: number;
    title: string;
    content: string;
}

interface BroadcastPayload {
    title: string;
    content: string;
}

interface UpdateNotificationPayload {
    title: string;
    content: string;
}

interface DeleteResponse {
    success: boolean;
    message: string;
}

export const notificationService = {
    getAll: (signal?: AbortSignal): Promise<GetAllNotificationsResponse> => {
        // Fetch all items by requesting a large page size.
        // This is a workaround for APIs that don't have a dedicated "get all" endpoint.
        const query = new URLSearchParams({
            page: '1',
            pageSize: '1000', // Assuming 1000 is high enough to get all notifications
        });
        return apiClient<GetAllNotificationsResponse>(`/notifications?${query.toString()}`, { signal });
    },
    sendToUser: (payload: SendNotificationPayload): Promise<Notification> => {
        return apiClient<Notification>('/notifications/send-to-user', {
            method: 'POST',
            data: payload,
        });
    },
    broadcast: (payload: BroadcastPayload): Promise<Notification[]> => {
        return apiClient<Notification[]>('/notifications/broadcast', {
            method: 'POST',
            data: payload,
        });
    },
    update: (id: number, payload: UpdateNotificationPayload): Promise<Notification> => {
        return apiClient<Notification>(`/notifications/${id}`, {
            method: 'PUT',
            data: payload,
        });
    },
    delete: (id: number): Promise<DeleteResponse> => {
        return apiClient<DeleteResponse>(`/notifications/${id}`, {
            method: 'DELETE',
        });
    },
};