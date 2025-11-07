// TypeScript types for e-commerce platform

export interface Product {
  id: string;
  name: {
    sk: string;
    en: string;
    cz: string;
    es: string;
  };
  description: {
    sk: string;
    en: string;
    cz: string;
    es: string;
  };
  slug: string;
  price: number;
  images: string[];
  stock: number;
  stock_quantity: number; // Alias for stock
  category: 'knihy' | 'pera' | 'snurky' | 'zurnal' | 'kalendar';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  email: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  total: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  shipping_address: ShippingAddress;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_snapshot: Product;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  tier: 'free' | 'supporter' | 'patron' | 'benefactor' | 'custom';
  amount: number;
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Donation {
  id: string;
  user_id: string | null;
  amount: number;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
}
