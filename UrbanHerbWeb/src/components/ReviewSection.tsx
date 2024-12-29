import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Flex,
  Avatar,
  Heading,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  useToast,
  HStack,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { ProductService } from '../services/product.service';

interface Review {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewSectionProps {
  slug: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ slug }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { state: { user } } = useAuth();
  const toast = useToast();

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await ProductService.getProductReviews(slug);
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: 'Error loading reviews',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Please log in',
        description: 'You must be logged in to submit a review',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      await ProductService.submitReview(slug, { rating, comment });
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setComment('');
      setRating(5);
      loadReviews(); // Reload reviews after submission
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error submitting review',
        description: 'Please try again later',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [slug]);

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Icon
        key={index}
        as={FaStar}
        color={index < rating ? 'yellow.400' : 'gray.300'}
      />
    ));
  };

  return (
    <Box py={8}>
      <Heading size="lg" mb={6}>Customer Reviews</Heading>
      
      {/* Review Form */}
      {user && (
        <Box mb={8} p={6} bg="white" borderRadius="lg" shadow="sm">
          <form onSubmit={handleSubmitReview}>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Rating</FormLabel>
                <Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Your Review</FormLabel>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your review here..."
                  required
                />
              </FormControl>
              <Button
                type="submit"
                colorScheme="green"
                isLoading={submitting}
                loadingText="Submitting..."
              >
                Submit Review
              </Button>
            </VStack>
          </form>
        </Box>
      )}

      {/* Reviews List */}
      <VStack spacing={4} align="stretch">
        {loading ? (
          <Text>Loading reviews...</Text>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <Box key={review.id} p={6} bg="white" borderRadius="lg" shadow="sm">
              <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={4}>
                  <Avatar
                    name={`${review.user.first_name} ${review.user.last_name}`}
                    src={review.user.avatar}
                  />
                  <Box>
                    <Text fontWeight="bold">
                      {review.user.first_name} {review.user.last_name}
                    </Text>
                    <HStack spacing={1}>
                      {renderStars(review.rating)}
                    </HStack>
                  </Box>
                </HStack>
                <Text color="gray.500" fontSize="sm">
                  {new Date(review.created_at).toLocaleDateString()}
                </Text>
              </Flex>
              <Text>{review.comment}</Text>
            </Box>
          ))
        ) : (
          <Text>No reviews yet. Be the first to review this product!</Text>
        )}
      </VStack>
    </Box>
  );
};

export default ReviewSection;
