import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPhonePage from './pages/VerifyPhonePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage';
import ProfilePage from './pages/ProfilePage';
import SocialAuthCallback from './pages/SocialAuthCallback';
import { SearchProvider } from './contexts/SearchContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import { Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        minHeight: '100vh',
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
      suspense: true,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Router>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <SearchProvider>
                    <Layout>
                      <Suspense fallback={<LoadingSpinner text="Loading..." />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                          <Route path="/verify-email" element={<VerifyEmailPage />} />
                          <Route path="/verify-phone" element={<VerifyPhonePage />} />
                          <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
                          <Route path="/auth/callback" element={<SocialAuthCallback />} />
                          <Route path="/products" element={<HomePage />} />
                          <Route path="/products/:id" element={<ProductDetailsPage />} />
                          <Route
                            path="/cart"
                            element={
                              <PrivateRoute>
                                <CartPage />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/wishlist"
                            element={
                              <PrivateRoute>
                                <WishlistPage />
                              </PrivateRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <PrivateRoute>
                                <ProfilePage />
                              </PrivateRoute>
                            }
                          />
                        </Routes>
                      </Suspense>
                    </Layout>
                  </SearchProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </Router>
        </ChakraProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
