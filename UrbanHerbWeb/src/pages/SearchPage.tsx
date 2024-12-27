import {
  Box,
  Container,
  Grid,
  GridItem,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useBreakpointValue
} from '@chakra-ui/react';
import { FaFilter } from 'react-icons/fa';
import { SearchBar } from '../components/SearchBar';
import { SearchFilters } from '../components/SearchFilters';
import { SearchResults } from '../components/SearchResults';

export const SearchPage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, lg: false });

  return (
    <Container maxW="container.xl" py={8}>
      <Grid
        templateColumns={{ base: '1fr', lg: '280px 1fr' }}
        gap={8}
      >
        {/* Search Bar - Full Width on Mobile */}
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <SearchBar />
        </GridItem>

        {/* Filters - Drawer on Mobile, Sidebar on Desktop */}
        {isMobile ? (
          <>
            <IconButton
              aria-label="Open filters"
              icon={<FaFilter />}
              position="fixed"
              bottom={4}
              right={4}
              colorScheme="green"
              size="lg"
              zIndex={20}
              onClick={onOpen}
            />
            <Drawer
              isOpen={isOpen}
              placement="left"
              onClose={onClose}
              size="full"
            >
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader>Filters</DrawerHeader>
                <DrawerBody>
                  <SearchFilters />
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <GridItem>
            <Box position="sticky" top={4}>
              <SearchFilters />
            </Box>
          </GridItem>
        )}

        {/* Search Results */}
        <GridItem>
          <SearchResults />
        </GridItem>
      </Grid>
    </Container>
  );
};
