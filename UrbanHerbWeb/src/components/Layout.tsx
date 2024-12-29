import React from 'react';
import { Box } from '@chakra-ui/react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box flex="1" as="main" py={8}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
