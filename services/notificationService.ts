
import { apiClient } from './apiClient';
import { Notification } from '../types';

interface GetAllNotificationsResponse {
    items: Notification[];
    // Include other pagination properties if the API provides them
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
        return apiClient<GetAllNotificationsResponse>('/notifications', { signal });
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
