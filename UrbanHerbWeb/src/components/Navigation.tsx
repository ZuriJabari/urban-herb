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
  const { isOpen, onToggle } = useDisclosure();
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { state: { user, accessToken, isLoading }, logout } = useAuth();

  console.log('Navigation - Auth State:', { user, accessToken, isLoading });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const searchInput = form.elements.namedItem('search') as HTMLInputElement;
    if (searchInput.value.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchInput.value.trim())}`);
      searchInput.value = '';
    }
  };

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
          width="100%"
          zIndex={1000}
          boxShadow="sm"
        >
          <Flex
            flex={{ base: 1, md: 'auto' }}
            ml={{ base: -2 }}
            display={{ base: 'flex', md: 'none' }}
          >
            <motion.div whileTap={{ scale: 0.95 }}>
              <IconButton
                onClick={onToggle}
                icon={isOpen ? <Icon as={CloseIcon} w={3} h={3} /> : <Icon as={HamburgerIcon} w={5} h={5} />}
                variant={'ghost'}
                aria-label={'Toggle Navigation'}
              />
            </motion.div>
          </Flex>

          <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Text
                textAlign={useBreakpointValue({ base: 'center', md: 'left' })}
                fontFamily={'heading'}
                color={useColorModeValue('gray.800', 'white')}
                fontWeight="bold"
                fontSize="xl"
                as={RouterLink}
                to="/"
              >
                UrbanHerb
              </Text>
            </motion.div>

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
            <Box display={{ base: 'none', md: 'block' }} maxW="300px">
              <form onSubmit={handleSearch}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    name="search"
                    type="search"
                    placeholder="Search products..."
                    size="sm"
                    _focus={{
                      borderColor: 'green.400',
                      boxShadow: '0 0 0 1px green.400',
                    }}
                  />
                </InputGroup>
              </form>
            </Box>

            {user ? (
              <>
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
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
                </motion.div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
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
                </motion.div>

                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                  >
                    <Avatar
                      size={'sm'}
                      name={`${user.first_name} ${user.last_name}`}
                    />
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to="/profile">
                      Profile
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/orders">
                      Orders
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={logout}>
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    as={RouterLink}
                    to="/login"
                    fontSize={'sm'}
                    fontWeight={400}
                    variant={'link'}
                  >
                    Sign In
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    as={RouterLink}
                    to="/register"
                    display={{ base: 'none', md: 'inline-flex' }}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'white'}
                    bg={'green.400'}
                    _hover={{
                      bg: 'green.500',
                    }}
                  >
                    Sign Up
                  </Button>
                </motion.div>
              </>
            )}
          </Stack>
        </Flex>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <Box display={{ md: 'none' }}>
            <MobileNav />
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

const DesktopNav = () => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => {
        const { isOpen, onToggle } = useDisclosure();
        return (
          <Box key={navItem.label}>
            <Popover trigger={'hover'} placement={'bottom-start'}>
              <PopoverTrigger>
                <motion.div
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    as={navItem.href ? RouterLink : 'span'}
                    to={navItem.href}
                    p={2}
                    fontSize={'sm'}
                    fontWeight={500}
                    color={linkColor}
                    _hover={{
                      textDecoration: 'none',
                      color: linkHoverColor,
                    }}
                    cursor="pointer"
                    display="flex"
                    alignItems="center"
                  >
                    {navItem.label}
                    {navItem.children && (
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon as={ChevronDownIcon} ml={1} w={3} h={3} />
                      </motion.div>
                    )}
                  </Box>
                </motion.div>
              </PopoverTrigger>

              {navItem.children && (
                <PopoverContent
                  border={0}
                  boxShadow={'xl'}
                  bg={popoverContentBgColor}
                  p={4}
                  rounded={'xl'}
                  minW={'sm'}
                  as={motion.div}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
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
        );
      })}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Box
      as={RouterLink}
      to={href || '#'}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('green.50', 'gray.900') }}
    >
      <motion.div
        whileHover={{ x: 5 }}
        transition={{ duration: 0.2 }}
      >
        <Stack direction={'row'} align={'center'}>
          <Box>
            <Text
              transition={'all .3s ease'}
              _groupHover={{ color: 'green.500' }}
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
            <Icon color={'green.500'} w={5} h={5} as={ChevronRightIcon} />
          </Flex>
        </Stack>
      </motion.div>
    </Box>
  );
};

const MobileNav = () => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ overflow: 'hidden' }}
    >
      <Stack
        bg={useColorModeValue('white', 'gray.800')}
        p={4}
        display={{ md: 'none' }}
        spacing={4}
        divider={<Box borderColor="gray.200" borderBottomWidth={1} />}
      >
        {NAV_ITEMS.map((navItem) => (
          <MobileNavItem key={navItem.label} {...navItem} />
        ))}
      </Stack>
    </motion.div>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
      >
        <Box
          py={2}
          as={href ? RouterLink : 'div'}
          to={href ?? '#'}
          onClick={children ? onToggle : undefined}
          role="group"
          cursor="pointer"
          _hover={{
            bg: useColorModeValue('gray.50', 'gray.700'),
          }}
          rounded="md"
          px={3}
        >
          <Stack direction="row" align="center" justify="space-between">
            <Text
              fontWeight={600}
              color={useColorModeValue('gray.600', 'gray.200')}
              _groupHover={{ color: useColorModeValue('gray.800', 'white') }}
            >
              {label}
            </Text>
            {children && (
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <Icon
                  as={ChevronDownIcon}
                  w={6}
                  h={6}
                  color={useColorModeValue('gray.600', 'gray.400')}
                  _groupHover={{ color: useColorModeValue('gray.800', 'white') }}
                />
              </motion.div>
            )}
          </Stack>
        </Box>
      </motion.div>

      <AnimatePresence>
        {isOpen && children && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Stack
              mt={2}
              pl={4}
              ml={4}
              borderLeft={1}
              borderStyle="solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              align="start"
              spacing={2}
            >
              {children.map((child) => (
                <motion.div
                  key={child.label}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%' }}
                >
                  <Box
                    as={RouterLink}
                    to={child.href || '#'}
                    py={2}
                    px={3}
                    rounded="md"
                    width="100%"
                    _hover={{
                      bg: useColorModeValue('gray.50', 'gray.700'),
                      color: useColorModeValue('gray.800', 'white'),
                    }}
                  >
                    <Text fontSize="sm">{child.label}</Text>
                    {child.subLabel && (
                      <Text fontSize="xs" color="gray.500">
                        {child.subLabel}
                      </Text>
                    )}
                  </Box>
                </motion.div>
              ))}
            </Stack>
          </motion.div>
        )}
      </AnimatePresence>
    </Stack>
  );
};
