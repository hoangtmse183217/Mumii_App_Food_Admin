
import { apiClient } from './apiClient';
import { Restaurant, RestaurantStatus } from '../types';

const RESTAURANT_API_BASE = 'http://localhost:8082/api/admin';

interface GetAllRestaurantsParams {
    page: number;
    pageSize: number;
    status?: RestaurantStatus;
}

interface GetAllRestaurantsResponse {
    items: Restaurant[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export type RestaurantUpdatePayload = Partial<Pick<Restaurant, 'name' | 'address' | 'description' | 'avgPrice'>>;


export const restaurantService = {
  getAll: (params: GetAllRestaurantsParams, signal?: AbortSignal): Promise<GetAllRestaurantsResponse> => {
    const query = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
    });
    if (params.status) {
        query.set('status', params.status);
    }
    return apiClient<GetAllRestaurantsResponse>(`/restaurants?${query.toString()}`, { baseUrlOverride: RESTAURANT_API_BASE, signal });
  },
  
  approve: (id: number): Promise<Restaurant> => {
    return apiClient<Restaurant>(`/restaurants/${id}/approve`, {
      method: 'POST',
      baseUrlOverride: RESTAURANT_API_BASE,
    });
  },

  decline: (id: number, reason: string): Promise<Restaurant> => {
    return apiClient<Restaurant>(`/restaurants/${id}/decline`, {
      method: 'POST',
      baseUrlOverride: RESTAURANT_API_BASE,
      data: { reason },
    });
  },

  update: (id: number, data: RestaurantUpdatePayload): Promise<Restaurant> => {
    return apiClient<Restaurant>(`/restaurants/${id}`, {
      method: 'PUT',
      baseUrlOverride: RESTAURANT_API_BASE,
      data,
    });
  },

  delete: (id: number): Promise<void> => {
    return apiClient<void>(`/restaurants/${id}`, {
      method: 'DELETE',
      baseUrlOverride: RESTAURANT_API_BASE,
    });
  },
};
