
import { apiClient } from './apiClient';
import { Post, PostUpdatePayload } from '../types';

const POST_API_BASE = 'http://localhost:8083/api/admin';

interface GetAllPostsParams {
    page: number;
    pageSize: number;
    partnerId?: number;
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
    if (params.partnerId) {
        query.set('partnerId', String(params.partnerId));
    }
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
};