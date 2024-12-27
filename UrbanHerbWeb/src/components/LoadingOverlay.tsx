import { Box, Center, Spinner, Text, useColorModeValue } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

export const LoadingOverlay = ({ isLoading, text }: LoadingOverlayProps) => {
  const bgColor = useColorModeValue('whiteAlpha.900', 'blackAlpha.900');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <AnimatePresence>
      {isLoading && (
        <Box
          as={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={bgColor}
          zIndex={9999}
          backdropFilter="blur(8px)"
        >
          <Center height="100vh" flexDirection="column">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="green.500"
                size="xl"
              />
            </motion.div>
            {text && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Text
                  mt={4}
                  fontSize="lg"
                  fontWeight="medium"
                  color={textColor}
                >
                  {text}
                </Text>
              </motion.div>
            )}
          </Center>
        </Box>
      )}
    </AnimatePresence>
  );
};
