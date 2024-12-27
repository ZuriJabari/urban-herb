import { CartItem } from './cart';
import { UserAddress } from './user';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay';

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  carrier: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  billingAddress: UserAddress;
}

export interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  minimumPurchase?: number;
  expiryDate?: string;
  applicableCategories?: string[];
}

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface CheckoutState {
  items: CartItem[];
  shippingAddress: UserAddress | null;
  billingAddress: UserAddress | null;
  shippingMethod: ShippingMethod | null;
  paymentDetails: PaymentDetails | null;
  promoCode: PromoCode | null;
  summary: OrderSummary;
}

export interface CheckoutContextType {
  state: CheckoutState;
  setShippingAddress: (address: UserAddress) => void;
  setBillingAddress: (address: UserAddress) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentDetails: (details: PaymentDetails) => void;
  applyPromoCode: (code: string) => Promise<void>;
  removePromoCode: () => void;
  placeOrder: () => Promise<string>; // Returns order ID
  validateStep: (step: 'shipping' | 'payment' | 'review') => boolean;
  calculateSummary: () => OrderSummary;
}
