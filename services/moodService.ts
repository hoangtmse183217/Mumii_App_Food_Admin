import { apiClient } from './apiClient';
import { Mood } from '../types';

const MOOD_API_BASE = 'https://mumii-social.onrender.com/api';

export const moodService = {
  getMoods: (): Promise<Mood[]> => {
    return apiClient<Mood[]>('/admin/moods', { baseUrlOverride: MOOD_API_BASE });
  },

  addMood: (mood: Omit<Mood, 'id' | 'createdAt'>): Promise<Mood> => {
    return apiClient<Mood>('/admin/moods', {
      method: 'POST',
      baseUrlOverride: MOOD_API_BASE,
      data: mood,
    });
  },

  updateMood: (mood: Mood): Promise<string> => {
    return apiClient<string>(`/admin/moods/${mood.id}`, {
      method: 'PUT',
      baseUrlOverride: MOOD_API_BASE,
      data: { name: mood.name, description: mood.description },
    });
  },

  deleteMood: (id: number): Promise<string> => {
    return apiClient<string>(`/admin/moods/${id}`, {
      method: 'DELETE',
      baseUrlOverride: MOOD_API_BASE,
    });
  },
};
