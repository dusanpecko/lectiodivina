-- E-Commerce and Donation Platform Schema for lectio.one
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name JSONB NOT NULL, -- Multi-language: {"sk": "Kniha", "en": "Book", ...}
  description JSONB NOT NULL, -- Multi-language description
  slug VARCHAR(255) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}', -- Array of image URLs
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100), -- 'knihy', 'pera', 'snurky', 'zurnal', 'kalendar'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, processing, shipped, completed, cancelled
  stripe_payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  shipping_address JSONB NOT NULL, -- {name, street, city, postal_code, country, phone, email}
  tracking_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_snapshot JSONB NOT NULL, -- Store product details at time of purchase
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL, -- Price at time of purchase
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  tier VARCHAR(50) NOT NULL, -- 'free', 'supporter', 'patron', 'benefactor', 'custom'
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, cancelled, past_due, incomplete
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table (one-time)
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  stripe_payment_id VARCHAR(255),
  stripe_session_id VARCHAR(255),
  message TEXT, -- Optional message from donor
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);

-- Row Level Security (RLS) policies

-- Products: Public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Orders: Users can view their own orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Order items: Users can view their own order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Subscriptions: Users can view their own subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Donations: Users can view their own donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own donations"
  ON donations FOR SELECT
  USING (auth.uid() = user_id OR is_anonymous = false);

CREATE POLICY "Admins can view all donations"
  ON donations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data (optional - for development)
INSERT INTO products (name, description, slug, price, stock, category, images) VALUES
(
  '{"sk": "Lectio Divina Žurnál", "en": "Lectio Divina Journal", "cz": "Lectio Divina Deník", "es": "Diario de Lectio Divina"}'::jsonb,
  '{"sk": "Krásny žurnál pre vaše duchovné poznámky", "en": "Beautiful journal for your spiritual notes", "cz": "Krásný deník pro vaše duchovní poznámky", "es": "Hermoso diario para tus notas espirituales"}'::jsonb,
  'lectio-divina-zurnal',
  12.99,
  50,
  'zurnal',
  ARRAY['https://placehold.co/600x400/EEE/31343C?text=Journal']
),
(
  '{"sk": "Liturgický kalendár 2025", "en": "Liturgical Calendar 2025", "cz": "Liturgický kalendář 2025", "es": "Calendario Litúrgico 2025"}'::jsonb,
  '{"sk": "Celý liturgický rok 2025 v jednom kalendári", "en": "Complete liturgical year 2025 in one calendar", "cz": "Celý liturgický rok 2025 v jednom kalendáři", "es": "Año litúrgico completo 2025 en un calendario"}'::jsonb,
  'liturgicky-kalendar-2025',
  15.99,
  100,
  'kalendar',
  ARRAY['https://placehold.co/600x400/EEE/31343C?text=Calendar']
);
