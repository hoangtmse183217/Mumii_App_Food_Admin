
import { User, Restaurant, Mood, Post, RestaurantStatus } from '../types';

let users: User[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  email: `user${i + 1}@example.com`,
  // FIX: Changed `fullName` to `fullname` to match the User type.
  fullname: `User ${i + 1}`,
  role: i % 3 === 0 ? 'Partner' : 'User',
  isActive: i % 5 !== 0,
  createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString().split('T')[0],
}));

// FIX: Updated the mock restaurant data structure to match the 'Restaurant' type from '../types.ts'
// and corrected the enum usage from 'REJECTED' to 'DECLINED'.
let restaurants: Restaurant[] = Array.from({ length: 15 }, (_, i) => ({
    id: i + 1,
    partnerId: i + 1,
    name: `Restaurant ${i + 1}`,
    address: `${i+1} Example St, City`,
    longitude: -122.4194 + (i * 0.01),
    latitude: 37.7749 - (i * 0.01),
    description: `This is a detailed description for Restaurant ${i+1}. It serves amazing food.`,
    avgPrice: 20 + i * 2,
    rating: parseFloat((3.5 + (i % 15) / 10).toFixed(1)),
    // FIX: Corrected enum usage from uppercase to PascalCase to match the type definition.
    status: i < 5 ? RestaurantStatus.Pending : (i < 10 ? RestaurantStatus.Approved : RestaurantStatus.Declined),
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    images: [],
    reviews: [],
    favoriteCount: i * 3
}));

// FIX: Added 'createdAt' property to each mood object to match the 'Mood' type definition.
let moods: Mood[] = [
    { id: 1, name: 'Happy', description: 'Feeling joyful and cheerful.', createdAt: new Date(Date.now() - 1 * 86400000).toISOString() },
    { id: 2, name: 'Sad', description: 'Feeling down and blue.', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 3, name: 'Romantic', description: 'In the mood for love.', createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 4, name: 'Adventurous', description: 'Ready for an exciting experience.', createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
];

let posts: Post[] = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    title: `Amazing Post Title ${i+1}`,
    author: `User ${i+1}`,
    status: i < 4 ? 'PENDING' : 'APPROVED',
    createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toISOString().split('T')[0],
}));

const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));
};

export const api = {
    getUsers: () => simulateDelay(users),
    updateUserStatus: (id: number, isActive: boolean) => {
        users = users.map(u => u.id === id ? { ...u, isActive } : u);
        return simulateDelay(users.find(u => u.id === id));
    },

    getRestaurants: (status?: RestaurantStatus) => {
        if (status) {
            return simulateDelay(restaurants.filter(r => r.status === status));
        }
        return simulateDelay(restaurants);
    },
    updateRestaurantStatus: (id: number, status: RestaurantStatus) => {
        restaurants = restaurants.map(r => r.id === id ? { ...r, status } : r);
        return simulateDelay(restaurants.find(r => r.id === id));
    },

    getMoods: () => simulateDelay(moods),
    // FIX: Changed signature to not require createdAt from client and handle it server-side. This fixes the type error in MoodList.tsx.
    addMood: (mood: Omit<Mood, 'id' | 'createdAt'>) => {
        const newMood: Mood = { ...mood, id: Math.max(0, ...moods.map(m => m.id)) + 1, createdAt: new Date().toISOString() };
        moods.push(newMood);
        return simulateDelay(newMood);
    },
    updateMood: (mood: Mood) => {
        moods = moods.map(m => m.id === mood.id ? mood : m);
        return simulateDelay(mood);
    },
    deleteMood: (id: number) => {
        moods = moods.filter(m => m.id !== id);
        return simulateDelay({ success: true });
    },
    
    getPosts: () => simulateDelay(posts),
};