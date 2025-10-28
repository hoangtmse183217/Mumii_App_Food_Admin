export interface UserProfile {
  id?: number;
  userId?: number;
  gender?: string;
  avatar?: string;
  phoneNumber?: string;
  address?: string;
}

export interface User {
  id: number;
  email: string;
  fullname: string;
  role: 'Admin' | 'User' | 'Partner';
  isActive: boolean;
  createdAt: string;
  accessToken?: string;
  loginMethod?: string;
  profile?: UserProfile;
}

export enum RestaurantStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Declined = 'Declined',
}

export interface RestaurantImage {
    id: string;
    restaurantId: number;
    imageUrl: string;
    createdAt: string;
}

export interface RestaurantReview {
    id: number;
    userId: number;
    restaurantId: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: User;
    partnerReplyComment: string | null;
    partnerReplyAt: string | null;
}

export interface Restaurant {
  id: number;
  partnerId: number;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  description: string;
  avgPrice: number;
  rating: number;
  status: RestaurantStatus;
  createdAt: string;
  images: RestaurantImage[];
  reviews: RestaurantReview[];
  favoriteCount: number;
  partner?: User; // Optional partner details to be populated
}


export interface Mood {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export interface Post {
    id: number;
    title: string;
    author: string;
    status: 'PENDING' | 'APPROVED' | 'DECLINED';
    createdAt: string;

    // Optional fields for detailed view
    partnerId?: number;
    restaurantId?: number;
    content?: string;
    imageUrl?: string;
    moods?: Mood[];
    restaurant?: {
        id: number;
        name: string;
        address: string;
    };
    partner?: User;
}

export interface PostUpdatePayload {
  title: string;
  content: string;
  imageUrl: string;
  restaurantId: number;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}