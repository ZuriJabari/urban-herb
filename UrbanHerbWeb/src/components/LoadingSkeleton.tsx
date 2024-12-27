import { Box, Skeleton, SkeletonText, Stack, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'product' | 'cart' | 'search';
}

export const LoadingSkeleton = ({ count = 1, type = 'product' }: LoadingSkeletonProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const items = Array.from({ length: count }, (_, i) => i);

  const skeletonVariants = {
    hidden: { opacity: 0 },
    visible: (i: number) => ({
      opacity: 1,
      transition: {
        delay: i * 0.1,
      },
    }),
  };

  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'product':
        return (
          <motion.div
            key={index}
            variants={skeletonVariants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
            <Box
              bg={bgColor}
              p={4}
              rounded="lg"
              shadow="sm"
              position="relative"
              overflow="hidden"
            >
              <Skeleton height="200px" mb={4} rounded="md" />
              <SkeletonText mt={4} noOfLines={2} spacing={4} skeletonHeight="2" />
              <Stack direction="row" mt={4} justify="space-between" align="center">
                <Skeleton height="24px" width="100px" />
                <Skeleton height="40px" width="40px" rounded="full" />
              </Stack>
            </Box>
          </motion.div>
        );

      case 'cart':
        return (
          <motion.div
            key={index}
            variants={skeletonVariants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
            <Stack
              direction={{ base: 'column', md: 'row' }}
              bg={bgColor}
              p={4}
              rounded="lg"
              shadow="sm"
              spacing={4}
              align="center"
            >
              <Skeleton height="100px" width="100px" rounded="md" />
              <Box flex="1">
                <SkeletonText noOfLines={2} spacing={4} skeletonHeight="2" />
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  mt={4}
                  justify="space-between"
                  align={{ base: 'start', md: 'center' }}
                >
                  <Skeleton height="24px" width="100px" />
                  <Stack direction="row" spacing={4} align="center">
                    <Skeleton height="32px" width="100px" />
                    <Skeleton height="32px" width="32px" rounded="full" />
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </motion.div>
        );

      case 'search':
        return (
          <motion.div
            key={index}
            variants={skeletonVariants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
            <Stack direction="row" spacing={4} align="center" p={2}>
              <Skeleton height="40px" width="40px" rounded="full" />
              <Box flex="1">
                <SkeletonText noOfLines={2} spacing={2} skeletonHeight="2" />
              </Box>
            </Stack>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Stack spacing={4}>
      {items.map((index) => renderSkeleton(index))}
    </Stack>
  );
};
