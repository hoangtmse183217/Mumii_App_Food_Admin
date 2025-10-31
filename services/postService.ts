import { apiClient } from './apiClient';
import { Post, PostUpdatePayload } from '../types';

const POST_API_BASE = 'https://mumii-social.onrender.com/api/admin';

interface GetAllPostsParams {
    page: number;
    pageSize: number;
}

interface GetAllPostsResponse {
    items: Post[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const postService = {
  getAll: (params: GetAllPostsParams, signal?: AbortSignal): Promise<GetAllPostsResponse> => {
    const query = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
    });
    return apiClient<GetAllPostsResponse>(`/posts?${query.toString()}`, { baseUrlOverride: POST_API_BASE, signal });
  },

  getById: (id: number, signal?: AbortSignal): Promise<Post> => {
    return apiClient<Post>(`/posts/${id}`, { baseUrlOverride: POST_API_BASE, signal });
  },

  update: (id: number, data: PostUpdatePayload): Promise<string> => {
    return apiClient<string>(`/posts/${id}`, {
      method: 'PUT',
      baseUrlOverride: POST_API_BASE,
      data,
    });
  },

  approve: (id: number): Promise<string> => {
    return apiClient<string>(`/posts/${id}/approve`, {
      method: 'POST',
      baseUrlOverride: POST_API_BASE,
    });
  },

  remove: (id: number): Promise<string> => {
    return apiClient<string>(`/posts/${id}/remove`, {
      method: 'POST',
      baseUrlOverride: POST_API_BASE,
    });
  },

  decline: (id: number): Promise<string> => {
    return apiClient<string>(`/posts/${id}/decline`, {
      method: 'POST',
      baseUrlOverride: POST_API_BASE,
    });
  },

  delete: (id: number): Promise<string> => {
    return apiClient<string>(`/posts/${id}`, {
      method: 'DELETE',
      baseUrlOverride: POST_API_BASE,
    });
  },
};