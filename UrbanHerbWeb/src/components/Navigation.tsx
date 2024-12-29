import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Container,
  Badge,
  HStack,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { FaHeart, FaShoppingCart, FaUser, FaSearch, FaFilter } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: 'Shop',
    children: [
      {
        label: 'All Products',
        subLabel: 'Browse our complete catalog',
        href: '/products',
      },
      {
        label: 'Categories',
        subLabel: 'Shop by product category',
        href: '/categories',
      },
      {
        label: 'New Arrivals',
        subLabel: 'See our latest products',
        href: '/new-arrivals',
      },
    ],
  },
  {
    label: 'Learn',
    children: [
      {
        label: 'CBD Guide',
        subLabel: 'Learn about CBD benefits',
        href: '/education',
      },
      {
        label: 'Blog',
        subLabel: 'Read our latest articles',
        href: '/blog',
      },
      {
        label: 'FAQ',
        subLabel: 'Common questions answered',
        href: '/faq',
      },
    ],
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

export const Navigation = () => {
  // Hooks
  const { isOpen, onToggle } = useDisclosure();
  const navigate = useNavigate();
  const { user, loading: isLoading, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const searchFormRef = useRef<HTMLFormElement>(null);

  // Logging auth state changes
  useEffect(() => {
    console.log('Navigation - Auth State Updated:', {
      user,
      isLoading,
      hasToken: !!localStorage.getItem('token'),
      hasRefreshToken: !!localStorage.getItem('refresh_token')
    });
  }, [user, isLoading]);

  // Event handlers
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFormRef.current) return;
    
    const searchInput = searchFormRef.current.elements.namedItem('search') as HTMLInputElement;
    if (searchInput?.value.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
      searchInput.value = '';
    }
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    try {
      console.log('Navigation - Starting logout');
      await logout();
      console.log('Navigation - Logout successful');
      navigate('/login');
    } catch (error) {
      console.error('Navigation - Logout error:', error);
    }
  }, [logout, navigate]);

  return (
    <Box>
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      >
        <Flex
          bg={useColorModeValue('white', 'gray.800')}
          color={useColorModeValue('gray.600', 'white')}
          minH={'60px'}
          py={{ base: 2 }}
          px={{ base: 4 }}
          borderBottom={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.900')}
          align={'center'}
          position="fixed"
          top={0}
          left={0}
          right={0}
          zIndex={1000}
        >
          <Container maxW="container.xl">
            <Flex
              flex={{ base: 1, md: 'auto' }}
              ml={{ base: -2 }}
              display={{ base: 'flex', md: 'none' }}
            >
              <IconButton
                onClick={onToggle}
                icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
                variant={'ghost'}
                aria-label={'Toggle Navigation'}
              />
            </Flex>
            <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                color={useColorModeValue('gray.800', 'white')}
                as={RouterLink}
                to="/"
                _hover={{
                  textDecoration: 'none',
                }}
              >
                UrbanHerb
              </Text>

              <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
                <DesktopNav />
              </Flex>
            </Flex>

            <Stack
              flex={{ base: 1, md: 0 }}
              justify={'flex-end'}
              direction={'row'}
              spacing={6}
              align="center"
            >
              <form onSubmit={handleSearch} ref={searchFormRef}>
                <InputGroup size="sm" maxW="200px">
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    name="search"
                    placeholder="Search..."
                    variant="filled"
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    _hover={{
                      bg: useColorModeValue('gray.200', 'gray.600'),
                    }}
                  />
                </InputGroup>
              </form>

              <IconButton
                as={RouterLink}
                to="/wishlist"
                variant="ghost"
                aria-label="Wishlist"
                icon={
                  <>
                    <Icon as={FaHeart} />
                    {wishlistItems.length > 0 && (
                      <Badge
                        colorScheme="red"
                        position="absolute"
                        top="-1"
                        right="-1"
                        fontSize="xs"
                        borderRadius="full"
                      >
                        {wishlistItems.length}
                      </Badge>
                    )}
                  </>
                }
              />

              <IconButton
                as={RouterLink}
                to="/cart"
                variant="ghost"
                aria-label="Shopping Cart"
                icon={
                  <>
                    <Icon as={FaShoppingCart} />
                    {cartItems.length > 0 && (
                      <Badge
                        colorScheme="green"
                        position="absolute"
                        top="-1"
                        right="-1"
                        fontSize="xs"
                        borderRadius="full"
                      >
                        {cartItems.length}
                      </Badge>
                    )}
                  </>
                }
              />

              {!isLoading && (
                user ? (
                  <Menu>
                    <MenuButton
                      as={Button}
                      rounded={'full'}
                      variant={'link'}
                      cursor={'pointer'}
                      minW={0}
                    >
                      <Avatar size={'sm'} />
                    </MenuButton>
                    <MenuList>
                      <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                      <MenuItem as={RouterLink} to="/orders">Orders</MenuItem>
                      <MenuItem as={RouterLink} to="/settings">Settings</MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
                    </MenuList>
                  </Menu>
                ) : (
                  <Button
                    as={RouterLink}
                    to="/login"
                    fontSize={'sm'}
                    fontWeight={400}
                    variant={'link'}
                    leftIcon={<FaUser />}
                  >
                    Sign In
                  </Button>
                )
              )}
            </Stack>
          </Container>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </motion.div>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Box
                as={navItem.href ? RouterLink : 'span'}
                to={navItem.href ?? '#'}
                p={2}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Box
      as={RouterLink}
      to={href ?? '#'}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('green.50', 'gray.900') }}
    >
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'green.400' }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: 1, transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}
        >
          <Icon color={'green.400'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Box>
  );
};

const MobileNav = () => {
  return (
    <Stack bg={useColorModeValue('white', 'gray.800')} p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Box
        py={2}
        as={href ? RouterLink : 'div'}
        to={href ?? '#'}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: 'none',
        }}
      >
        <Text fontWeight={600} color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Box>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}
        >
          {children &&
            children.map((child) => (
              <Box
                key={child.label}
                py={2}
                as={RouterLink}
                to={child.href ?? '#'}
              >
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};
