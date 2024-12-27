import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Avatar,
  Icon,
  Button,
  Divider,
  useToast,
  Flex,
  Badge
} from '@chakra-ui/react';
import { FaStar, FaCheck, FaThumbsUp } from 'react-icons/fa';
import { useState } from 'react';
import { Review, ReviewStats } from '../types/review';
import { getProductReviews, getReviewStats } from '../data/mockReviews';

interface ReviewsProps {
  productId: string;
}

export const Reviews = ({ productId }: ReviewsProps) => {
  const reviews = getProductReviews(productId);
  const stats = getReviewStats(productId);
  const toast = useToast();
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  const handleHelpful = (reviewId: string) => {
    if (helpfulReviews.has(reviewId)) {
      toast({
        title: 'Already marked as helpful',
        status: 'info',
        duration: 2000,
      });
      return;
    }

    setHelpfulReviews(prev => new Set([...prev, reviewId]));
    toast({
      title: 'Thanks for your feedback!',
      status: 'success',
      duration: 2000,
    });
  };

  const RatingStars = ({ rating }: { rating: number }) => (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          as={FaStar}
          color={star <= rating ? 'yellow.400' : 'gray.300'}
        />
      ))}
    </HStack>
  );

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Rating Summary */}
        <HStack spacing={8} align="start">
          <VStack align="center" minW="150px">
            <Text fontSize="4xl" fontWeight="bold">
              {stats.averageRating.toFixed(1)}
            </Text>
            <RatingStars rating={Math.round(stats.averageRating)} />
            <Text color="gray.500">
              {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
            </Text>
          </VStack>

          <VStack flex={1} spacing={2} align="stretch">
            {[5, 4, 3, 2, 1].map((rating) => (
              <HStack key={rating} spacing={4}>
                <Text minW="20px">{rating}</Text>
                <Icon as={FaStar} color="yellow.400" />
                <Progress
                  value={(stats.ratingDistribution[rating] || 0) / stats.totalReviews * 100}
                  size="sm"
                  colorScheme="yellow"
                  flex={1}
                />
                <Text minW="40px">
                  {stats.ratingDistribution[rating] || 0}
                </Text>
              </HStack>
            ))}
          </VStack>
        </HStack>

        <Divider />

        {/* Reviews List */}
        <VStack spacing={6} align="stretch">
          {reviews.map((review) => (
            <Box key={review.id} p={4} borderWidth="1px" borderRadius="lg">
              <HStack spacing={4} mb={4}>
                <Avatar size="sm" name={review.userName} />
                <VStack align="start" spacing={1}>
                  <HStack>
                    <Text fontWeight="bold">{review.userName}</Text>
                    {review.verified && (
                      <Badge colorScheme="green">
                        <HStack spacing={1}>
                          <Icon as={FaCheck} />
                          <Text>Verified Purchase</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>
                  <RatingStars rating={review.rating} />
                </VStack>
              </HStack>

              <Text mb={4}>{review.comment}</Text>

              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
                <Button
                  size="sm"
                  leftIcon={<Icon as={FaThumbsUp} />}
                  variant="ghost"
                  onClick={() => handleHelpful(review.id)}
                  isDisabled={helpfulReviews.has(review.id)}
                >
                  Helpful ({review.helpful + (helpfulReviews.has(review.id) ? 1 : 0)})
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};
