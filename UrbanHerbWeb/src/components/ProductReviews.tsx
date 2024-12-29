import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  useColorModeValue,
  useToast,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Select,
  Progress,
  SimpleGrid,
  IconButton,
  Tooltip,
  Flex,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { StarRating } from './StarRating';
import { ProductService } from '../services/product.service';
import { useAuth } from '../contexts/AuthContext';
import { FaThumbsUp, FaThumbsDown, FaFlag, FaSort, FaFilter } from 'react-icons/fa';

interface Review {
  id: number;
  user_email: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  helpful_votes: number;
  unhelpful_votes: number;
  verified_purchase: boolean;
  images?: string[];
}

interface ProductReviewsProps {
  productId: number;
}

interface RatingStats {
  average: number;
  total: number;
  distribution: { [key: number]: number };
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState<RatingStats>({
    average: 0,
    total: 0,
    distribution: {},
  });
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    content: '',
    images: [] as File[],
  });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  useEffect(() => {
    filterAndSortReviews();
  }, [reviews, sortBy, filterRating, showVerifiedOnly]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const data = await ProductService.getProductReviews(productId);
      setReviews(data);
      calculateRatingStats(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRatingStats = (reviewData: Review[]) => {
    const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;
    let sum = 0;

    reviewData.forEach((review) => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
      sum += review.rating;
      total++;
    });

    setRatingStats({
      average: total > 0 ? sum / total : 0,
      total,
      distribution,
    });
  };

  const filterAndSortReviews = () => {
    let filtered = [...reviews];

    // Apply rating filter
    if (filterRating) {
      filtered = filtered.filter((review) => review.rating === filterRating);
    }

    // Apply verified purchase filter
    if (showVerifiedOnly) {
      filtered = filtered.filter((review) => review.verified_purchase);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'helpful':
        filtered.sort((a, b) => b.helpful_votes - a.helpful_votes);
        break;
      case 'rating-high':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filtered.sort((a, b) => a.rating - b.rating);
        break;
    }

    setFilteredReviews(filtered);
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to submit a review',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('rating', newReview.rating.toString());
      formData.append('title', newReview.title);
      formData.append('content', newReview.content);
      newReview.images.forEach((image) => {
        formData.append('images', image);
      });

      await ProductService.submitReview(productId, formData);
      toast({
        title: 'Review Submitted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      onClose();
      fetchReviews();
      setNewReview({ rating: 5, title: '', content: '', images: [] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleVote = async (reviewId: number, isHelpful: boolean) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to vote on reviews',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await ProductService.voteReview(reviewId, isHelpful);
      fetchReviews();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit vote',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleReportReview = async (reviewId: number) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to report reviews',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      await ProductService.reportReview(reviewId);
      toast({
        title: 'Review Reported',
        description: 'Thank you for helping maintain our community standards',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to report review',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return <Text>Loading reviews...</Text>;
  }

  return (
    <Box>
      {/* Rating Summary */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        <Box>
          <HStack spacing={4} align="center">
            <Text fontSize="4xl" fontWeight="bold">
              {ratingStats.average.toFixed(1)}
            </Text>
            <VStack align="start">
              <StarRating rating={ratingStats.average} size="20px" />
              <Text color="gray.500">
                Based on {ratingStats.total} reviews
              </Text>
            </VStack>
          </HStack>
        </Box>
        <Box>
          {[5, 4, 3, 2, 1].map((rating) => (
            <HStack key={rating} spacing={4} mb={2}>
              <Text width="20px">{rating}★</Text>
              <Progress
                value={(ratingStats.distribution[rating] / ratingStats.total) * 100}
                size="sm"
                colorScheme="green"
                flex={1}
              />
              <Text width="40px">
                {ratingStats.distribution[rating] || 0}
              </Text>
            </HStack>
          ))}
        </Box>
      </SimpleGrid>

      {/* Filters and Sort */}
      <HStack justify="space-between" mb={6}>
        <HStack spacing={4}>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            width="auto"
            leftIcon={<FaSort />}
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </Select>
          <Button
            leftIcon={<FaFilter />}
            variant={showVerifiedOnly ? 'solid' : 'outline'}
            colorScheme="green"
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
          >
            Verified Only
          </Button>
        </HStack>
        <Button colorScheme="green" onClick={onOpen}>
          Write a Review
        </Button>
      </HStack>

      {/* Reviews List */}
      <VStack spacing={4} align="stretch">
        {filteredReviews.map((review) => (
          <Box
            key={review.id}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={bgColor}
          >
            <HStack spacing={4} align="start">
              <Avatar size="sm" name={review.user_email} />
              <VStack align="start" flex={1} spacing={2}>
                <HStack justify="space-between" width="100%">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{review.title}</Text>
                    <Text fontSize="sm" color="gray.500">
                      by {review.user_email}
                    </Text>
                  </VStack>
                  <HStack>
                    {review.verified_purchase && (
                      <Badge colorScheme="green">Verified Purchase</Badge>
                    )}
                    <Text fontSize="sm" color="gray.500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </HStack>
                </HStack>
                <StarRating rating={review.rating} size="14px" />
                <Text>{review.content}</Text>

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <SimpleGrid columns={4} spacing={2} mt={2}>
                    {review.images.map((image, index) => (
                      <Box
                        key={index}
                        width="100px"
                        height="100px"
                        borderRadius="md"
                        overflow="hidden"
                      >
                        <img
                          src={image}
                          alt={`Review image ${index + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    ))}
                  </SimpleGrid>
                )}

                <Divider my={2} />

                {/* Review Actions */}
                <HStack spacing={4}>
                  <HStack>
                    <Tooltip label="Helpful">
                      <IconButton
                        aria-label="Helpful"
                        icon={<FaThumbsUp />}
                        size="sm"
                        onClick={() => handleVote(review.id, true)}
                      />
                    </Tooltip>
                    <Text fontSize="sm">{review.helpful_votes}</Text>
                  </HStack>
                  <HStack>
                    <Tooltip label="Not Helpful">
                      <IconButton
                        aria-label="Not Helpful"
                        icon={<FaThumbsDown />}
                        size="sm"
                        onClick={() => handleVote(review.id, false)}
                      />
                    </Tooltip>
                    <Text fontSize="sm">{review.unhelpful_votes}</Text>
                  </HStack>
                  <Tooltip label="Report Review">
                    <IconButton
                      aria-label="Report Review"
                      icon={<FaFlag />}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleReportReview(review.id)}
                    />
                  </Tooltip>
                </HStack>
              </VStack>
            </HStack>
          </Box>
        ))}

        {filteredReviews.length === 0 && (
          <Text color="gray.500" textAlign="center">
            No reviews match your current filters.
          </Text>
        )}
      </VStack>

      {/* Write Review Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Write a Review</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Rating</FormLabel>
                <Select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({ ...newReview, rating: Number(e.target.value) })
                  }
                >
                  <option value="5">5 Stars - Excellent</option>
                  <option value="4">4 Stars - Very Good</option>
                  <option value="3">3 Stars - Good</option>
                  <option value="2">2 Stars - Fair</option>
                  <option value="1">1 Star - Poor</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  value={newReview.title}
                  onChange={(e) =>
                    setNewReview({ ...newReview, title: e.target.value })
                  }
                  placeholder="Summary of your review"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Review</FormLabel>
                <Textarea
                  value={newReview.content}
                  onChange={(e) =>
                    setNewReview({ ...newReview, content: e.target.value })
                  }
                  placeholder="Share your experience with this product"
                  minHeight="150px"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Images (Optional)</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setNewReview({ ...newReview, images: files });
                  }}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  You can upload up to 5 images
                </Text>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmitReview}
              isDisabled={!newReview.title || !newReview.content}
            >
              Submit Review
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};
