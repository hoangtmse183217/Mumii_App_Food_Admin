import { apiClient } from './apiClient';
import { Mood } from '../types';

const MOOD_API_BASE = 'https://mumii-discovery.onrender.com/api/admin';

export const moodService = {
  getMoods: (): Promise<Mood[]> => {
    return apiClient<Mood[]>('/moods', { baseUrlOverride: MOOD_API_BASE });
  },

  addMood: (mood: Omit<Mood, 'id' | 'createdAt'>): Promise<Mood> => {
    return apiClient<Mood>('/moods', {
      method: 'POST',
      baseUrlOverride: MOOD_API_BASE,
      data: mood,
    });
  },

  updateMood: (mood: Mood): Promise<string> => {
    return apiClient<string>(`/moods/${mood.id}`, {
      method: 'PUT',
      baseUrlOverride: MOOD_API_BASE,
      data: { name: mood.name, description: mood.description },
    });
  },

  deleteMood: (id: number): Promise<string> => {
    return apiClient<string>(`/moods/${id}`, {
      method: 'DELETE',
      baseUrlOverride: MOOD_API_BASE,
    });
  },
};