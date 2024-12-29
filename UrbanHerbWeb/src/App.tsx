import React, { Suspense } from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Layout from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { SearchProvider } from './contexts/SearchContext';
import LoadingSpinner from './components/LoadingSpinner';
import { ErrorBoundary, ErrorUI } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = React.lazy(() => import('./pages/ProductDetailPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const WishlistPage = React.lazy(() => import('./pages/WishlistPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const OrdersPage = React.lazy(() => import('./pages/OrdersPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const theme = extendTheme({
  styles: {
    global: {
      body: {
        minHeight: '100vh',
        bg: 'gray.50',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'green',
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <SearchProvider>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/products" element={<ProductsPage />} />
                          <Route path="/products/:slug" element={<ProductDetailPage />} />
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/verify-email" element={<VerifyEmailPage />} />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <ProfilePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/orders"
                            element={
                              <ProtectedRoute>
                                <OrdersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </Layout>
                  </SearchProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
