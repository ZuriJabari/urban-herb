import { Box } from '@chakra-ui/react';
import { Navigation } from './Navigation';
import { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { PageTransition } from './PageTransition';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <Box>
      <Navigation />
      <Box pt="60px"> {/* Add padding to account for fixed navbar */}
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {children}
          </PageTransition>
        </AnimatePresence>
      </Box>
    </Box>
  );
};
