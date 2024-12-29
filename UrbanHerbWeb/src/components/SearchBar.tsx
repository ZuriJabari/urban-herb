import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Icon,
  VStack,
  Text,
  HStack,
  Tag,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  Spinner,
} from '@chakra-ui/react';
import { FaSearch, FaTimes, FaHistory, FaFilter } from 'react-icons/fa';
import { useSearch } from '../contexts/SearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash/debounce';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types/product';
import { SearchFilters } from './SearchFilters';
import { useDebounce } from '../hooks/useDebounce';

const MotionBox = motion(Box);

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const MAX_RECENT_SEARCHES = 5;
const SUGGESTION_DELAY = 300;

export const SearchBar = ({
  onSearch,
  placeholder = 'Search products...',
  autoFocus = false,
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, SUGGESTION_DELAY);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // Replace this with your actual API call
      const response = await fetch(`/api/search/suggestions?q=${searchQuery}`);
      const data = await response.json();
      setSuggestions(data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Clear current search
    setQuery('');
    setSuggestions([]);

    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    onSearch?.(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim()) {
      handleSearch(query);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const removeRecentSearch = (searchTerm: string) => {
    const newRecentSearches = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
  };

  return (
    <Box position="relative" width="100%">
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <Icon as={FaSearch} color="gray.300" />
        </InputLeftElement>
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          autoFocus={autoFocus}
          pr="4.5rem"
        />
        <InputRightElement width="4.5rem">
          <HStack spacing={1}>
            {query && (
              <IconButton
                aria-label="Clear search"
                icon={<FaTimes />}
                size="sm"
                variant="ghost"
                onClick={() => setQuery('')}
              />
            )}
            <IconButton
              aria-label="Filter"
              icon={<FaHistory />}
              size="sm"
              variant="ghost"
              onClick={onOpen}
            />
          </HStack>
        </InputRightElement>
      </InputGroup>

      <AnimatePresence>
        {(suggestions.length > 0 || recentSearches.length > 0) && query.length >= 2 && (
          <MotionBox
            position="absolute"
            top="100%"
            left={0}
            right={0}
            mt={2}
            bg="white"
            boxShadow="lg"
            borderRadius="md"
            zIndex={10}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <VStack align="stretch" spacing={0} maxH="400px" overflowY="auto">
              {isLoading ? (
                <Box p={4} textAlign="center">
                  <Spinner size="sm" />
                </Box>
              ) : (
                <>
                  {suggestions.map((suggestion) => (
                    <Box
                      key={suggestion.id}
                      p={3}
                      _hover={{ bg: 'gray.50' }}
                      cursor="pointer"
                      onClick={() => handleSearch(suggestion.name)}
                    >
                      <HStack>
                        <Icon as={FaSearch} color="gray.400" />
                        <Text>{suggestion.name}</Text>
                      </HStack>
                    </Box>
                  ))}

                  {recentSearches.length > 0 && (
                    <Box p={3} borderTop="1px" borderColor="gray.100">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" color="gray.500">
                          Recent Searches
                        </Text>
                        <Text
                          fontSize="sm"
                          color="red.500"
                          cursor="pointer"
                          onClick={clearRecentSearches}
                        >
                          Clear All
                        </Text>
                      </HStack>
                      {recentSearches.map((search) => (
                        <HStack key={search} mb={2}>
                          <Icon as={FaHistory} color="gray.400" />
                          <Text
                            flex="1"
                            cursor="pointer"
                            onClick={() => handleSearch(search)}
                          >
                            {search}
                          </Text>
                          <IconButton
                            aria-label="Remove search"
                            icon={<FaTimes />}
                            size="xs"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(search);
                            }}
                          />
                        </HStack>
                      ))}
                    </Box>
                  )}
                </>
              )}
            </VStack>
          </MotionBox>
        )}
      </AnimatePresence>

      <Drawer
        isOpen={isOpen}
        placement={isMobile ? 'bottom' : 'right'}
        onClose={onClose}
        size={isMobile ? 'full' : 'md'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Search Filters</DrawerHeader>
          <DrawerBody>
            <SearchFilters onApply={onClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};
