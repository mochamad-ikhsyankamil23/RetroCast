-- ==========================================
-- RETROCAST: SUPABASE SCHEMA & SEED DATA
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SELLERS TABLE
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'whatsapp', 'facebook', 'tokopedia', 'shopee', 'other')),
  contact TEXT NOT NULL,
  rating NUMERIC(3,2) CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ITEMS TABLE
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL CHECK (brand IN ('hotwheels', 'tomica', 'minigt', 'tarmac', 'inno64', 'other')),
  scale TEXT NOT NULL,
  price BIGINT NOT NULL,
  image_url TEXT,
  category TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_date DATE NOT NULL,
  eta_date DATE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  total_price BIGINT NOT NULL,
  shipping_cost BIGINT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'booking' CHECK (status IN ('booking', 'dp', 'lunas', 'batal', 'sudah_tiba')),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PAYMENTS TABLE
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('dp', 'pelunasan')),
  due_date DATE NOT NULL,
  amount BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'belum_bayar' CHECK (status IN ('belum_bayar', 'sudah_bayar')),
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. REMINDERS TABLE
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('tanggal', 'mingguan', 'quarterly')),
  title TEXT NOT NULL,
  date DATE, -- Required for 'tanggal'
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- Required for 'mingguan'
  quarter_month INTEGER CHECK (quarter_month IN (1, 4, 7, 10)), -- Required for 'quarterly'
  time TIME DEFAULT '08:00:00',
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id UUID NOT NULL REFERENCES reminders(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'browser', 'inapp')),
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  error_message TEXT
);

-- UPDATE TRIGGERS FOR `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- SEED DATA (3 Sellers, 5 Items, 10 Orders)
-- ==========================================

-- Insert 3 Sellers
INSERT INTO sellers (id, name, platform, contact, rating, notes) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Diecast King', 'tokopedia', 'diecastking_official', 4.9, 'Trusted seller since 2018'),
  ('22222222-2222-2222-2222-222222222222', 'JDM Auto Toys', 'instagram', '@jdmauto.toys', 4.8, 'Fast response via DM'),
  ('33333333-3333-3333-3333-333333333333', 'Hobby Hub', 'shopee', 'hobbyhub_id', 4.7, 'Great packaging, sometimes slow ship');

-- Insert 5 Items
INSERT INTO items (id, name, brand, scale, price, category) VALUES
  ('aaaa1111-aaaa-1111-aaaa-111111111111', 'Hot Wheels RLC Skyline R34', 'hotwheels', '1:64', 1500000, 'JDM'),
  ('bbbb2222-bbbb-2222-bbbb-222222222222', 'Tomica Limited Vintage Nissan GTR', 'tomica', '1:64', 850000, 'JDM'),
  ('cccc3333-cccc-3333-cccc-333333333333', 'MiniGT Porsche 911 GT3', 'minigt', '1:64', 350000, 'Supercar'),
  ('dddd4444-dddd-4444-dddd-444444444444', 'Tarmac Works Civic Type R FK8', 'tarmac', '1:64', 450000, 'JDM'),
  ('eeee5555-eeee-5555-eeee-555555555555', 'Inno64 LBWK Ferrari 458', 'inno64', '1:64', 550000, 'Supercar');

-- Insert 10 Orders
INSERT INTO orders (id, order_date, eta_date, quantity, total_price, status, seller_id, item_id, notes) VALUES
  ('d0000001-0000-0000-0000-000000000001', '2024-05-01', '2024-07-15', 1, 1500000, 'dp', '11111111-1111-1111-1111-111111111111', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'Booking early'),
  ('d0000002-0000-0000-0000-000000000002', '2024-05-15', '2024-08-01', 2, 1700000, 'booking', '22222222-2222-2222-2222-222222222222', 'bbbb2222-bbbb-2222-bbbb-222222222222', 'For display and keep'),
  ('d0000003-0000-0000-0000-000000000003', '2024-06-01', '2024-06-20', 1, 350000, 'sudah_tiba', '33333333-3333-3333-3333-333333333333', 'cccc3333-cccc-3333-cccc-333333333333', 'Arrived safely'),
  ('d0000004-0000-0000-0000-000000000004', '2024-06-10', '2024-07-25', 1, 450000, 'dp', '11111111-1111-1111-1111-111111111111', 'dddd4444-dddd-4444-dddd-444444444444', ''),
  ('d0000005-0000-0000-0000-000000000005', '2024-06-12', '2024-08-10', 1, 550000, 'lunas', '22222222-2222-2222-2222-222222222222', 'eeee5555-eeee-5555-eeee-555555555555', 'Waiting for shipping'),
  ('d0000006-0000-0000-0000-000000000006', '2024-06-20', '2024-09-01', 3, 1050000, 'booking', '33333333-3333-3333-3333-333333333333', 'cccc3333-cccc-3333-cccc-333333333333', 'Wholesale for friends'),
  ('d0000007-0000-0000-0000-000000000007', '2024-06-25', '2024-07-30', 1, 1500000, 'dp', '11111111-1111-1111-1111-111111111111', 'aaaa1111-aaaa-1111-aaaa-111111111111', 'Second unit'),
  ('d0000008-0000-0000-0000-000000000008', '2024-07-01', '2024-08-15', 1, 850000, 'booking', '22222222-2222-2222-2222-222222222222', 'bbbb2222-bbbb-2222-bbbb-222222222222', ''),
  ('d0000009-0000-0000-0000-000000000009', '2024-07-03', '2024-07-10', 1, 450000, 'batal', '33333333-3333-3333-3333-333333333333', 'dddd4444-dddd-4444-dddd-444444444444', 'Seller out of stock'),
  ('d0000010-0000-0000-0000-000000000010', '2024-07-04', '2024-08-20', 1, 550000, 'dp', '11111111-1111-1111-1111-111111111111', 'eeee5555-eeee-5555-eeee-555555555555', '');

-- Insert Payments for some orders
INSERT INTO payments (order_id, type, due_date, amount, status, paid_at) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'dp', '2024-05-05', 500000, 'sudah_bayar', '2024-05-02 10:00:00'),
  ('d0000001-0000-0000-0000-000000000001', 'pelunasan', '2024-07-10', 1000000, 'belum_bayar', NULL),
  ('d0000003-0000-0000-0000-000000000003', 'pelunasan', '2024-06-05', 350000, 'sudah_bayar', '2024-06-02 14:00:00'),
  ('d0000004-0000-0000-0000-000000000004', 'dp', '2024-06-15', 200000, 'sudah_bayar', '2024-06-11 09:30:00'),
  ('d0000004-0000-0000-0000-000000000004', 'pelunasan', '2024-07-20', 250000, 'belum_bayar', NULL),
  ('d0000005-0000-0000-0000-000000000005', 'pelunasan', '2024-06-15', 550000, 'sudah_bayar', '2024-06-13 11:00:00');

-- Insert Reminders for some orders
INSERT INTO reminders (order_id, type, title, date, day_of_week, quarter_month) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'tanggal', 'Bayar Pelunasan RLC Skyline', '2024-07-07', NULL, NULL),
  ('d0000004-0000-0000-0000-000000000004', 'mingguan', 'Cek ETA Tarmac Civic', NULL, 0, NULL),
  ('d0000005-0000-0000-0000-000000000005', 'quarterly', 'Review Inno64 Order', NULL, NULL, 7);

-- Create a View for Dashboard Analytics (Optional but helpful)
CREATE VIEW dashboard_stats AS
SELECT 
  (SELECT COUNT(*) FROM orders WHERE status NOT IN ('sudah_tiba', 'batal')) AS active_orders,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'sudah_bayar' AND EXTRACT(MONTH FROM paid_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM paid_at) = EXTRACT(YEAR FROM CURRENT_DATE)) AS monthly_expense,
  (SELECT COUNT(*) FROM orders WHERE status = 'sudah_tiba' AND EXTRACT(MONTH FROM updated_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM updated_at) = EXTRACT(YEAR FROM CURRENT_DATE)) AS items_arrived_this_month,
  (SELECT COUNT(*) FROM sellers) AS total_sellers;
