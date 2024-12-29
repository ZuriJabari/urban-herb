import React from 'react';
import { Icon, HStack } from '@chakra-ui/react';
import { FaStar, FaStarHalf } from 'react-icons/fa';

interface StarRatingProps {
  rating: number;
  size?: string;
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  size = '1em', 
  color = 'yellow.400' 
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Icon 
        key={`full-${i}`} 
        as={FaStar} 
        color={color} 
        boxSize={size} 
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <Icon 
        key="half" 
        as={FaStarHalf} 
        color={color} 
        boxSize={size} 
      />
    );
  }

  // Add empty stars
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Icon 
        key={`empty-${i}`} 
        as={FaStar} 
        color="gray.300" 
        boxSize={size} 
      />
    );
  }

  return <HStack spacing={1}>{stars}</HStack>;
};
