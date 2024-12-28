import { Product } from './product';

export interface WishlistItem {
  productId: number;
  addedAt: string;
}

export interface WishlistContextType {
  items: WishlistItem[];
  addItem: (productId: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  moveToCart: (productId: number) => Promise<void>;
  clearWishlist: () => Promise<void>;
  loading: boolean;
}
