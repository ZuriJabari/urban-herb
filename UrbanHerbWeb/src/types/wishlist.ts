import { Product } from './product';

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface WishlistContextType {
  items: WishlistItem[];
  addItem: (productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  loading: boolean;
}
