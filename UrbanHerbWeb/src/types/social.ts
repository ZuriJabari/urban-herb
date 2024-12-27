export type SocialPlatform = 'facebook' | 'twitter' | 'pinterest' | 'email' | 'whatsapp' | 'copy';

export interface ShareData {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export interface SocialMetrics {
  shares: number;
  likes: number;
  comments: number;
}

export interface UserReview {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title: string;
  content: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: string;
  updatedAt: string;
  replies?: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }[];
}

export interface SocialContextType {
  metrics: { [key: string]: SocialMetrics };
  share: (platform: SocialPlatform, data: ShareData) => Promise<void>;
  submitReview: (review: Omit<UserReview, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReview: (reviewId: string, updates: Partial<UserReview>) => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  markHelpful: (reviewId: string, helpful: boolean) => Promise<void>;
  replyToReview: (reviewId: string, content: string) => Promise<void>;
  getMetrics: (productId: string) => Promise<SocialMetrics>;
}
