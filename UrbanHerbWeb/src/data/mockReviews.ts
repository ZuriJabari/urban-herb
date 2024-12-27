import { Review } from '../types/review';

export const mockReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: 'user1',
    userName: 'John D.',
    rating: 5,
    comment: 'Amazing product for anxiety relief. I use it daily and notice a significant difference in my stress levels.',
    createdAt: '2024-12-20T10:00:00Z',
    helpful: 15,
    verified: true
  },
  {
    id: '2',
    productId: '1',
    userId: 'user2',
    userName: 'Sarah M.',
    rating: 4,
    comment: 'Good quality CBD oil. The taste is mild and pleasant. Would recommend starting with a lower dose.',
    createdAt: '2024-12-19T15:30:00Z',
    helpful: 8,
    verified: true
  },
  {
    id: '3',
    productId: '2',
    userId: 'user3',
    userName: 'Mike R.',
    rating: 5,
    comment: 'These gummies are perfect for sleep. I take one about an hour before bed and sleep like a baby.',
    createdAt: '2024-12-18T20:15:00Z',
    helpful: 12,
    verified: true
  },
  {
    id: '4',
    productId: '2',
    userId: 'user4',
    userName: 'Emma L.',
    rating: 3,
    comment: 'The effects are good but I find them a bit too sweet for my taste.',
    createdAt: '2024-12-17T14:20:00Z',
    helpful: 5,
    verified: true
  }
];

export const getProductReviews = (productId: string): Review[] => {
  return mockReviews.filter(review => review.productId === productId);
};

export const getReviewStats = (productId: string) => {
  const reviews = getProductReviews(productId);
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: {}
    };
  }

  const ratingSum = reviews.reduce((sum, review) => sum + review.rating, 0);
  const ratingDistribution = reviews.reduce((dist, review) => {
    dist[review.rating] = (dist[review.rating] || 0) + 1;
    return dist;
  }, {} as { [key: number]: number });

  return {
    averageRating: ratingSum / totalReviews,
    totalReviews,
    ratingDistribution
  };
};
