-- ========================================================
-- SHOP RECORD BOOK DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PRODUCTS TABLE (Fixed Price List)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SALES TABLE
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'card')),
    entered_by_id UUID,
    entered_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 3. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    description TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer', 'card')),
    entered_by_id UUID,
    entered_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 4. CUSTOMER DEBTS TABLE
CREATE TABLE IF NOT EXISTS public.customer_debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    amount_owed NUMERIC(12, 2) NOT NULL CHECK (amount_owed > 0),
    status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid')),
    entered_by_id UUID,
    entered_by_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    paid_by_name TEXT,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- 5. AUDIT LOGS TABLE (Immutable Edit & Delete History)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_type TEXT NOT NULL, -- 'sale', 'expense', 'debt'
    record_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'CREATED', 'EDITED', 'DELETED', 'MARKED_PAID'
    performed_by_name TEXT NOT NULL,
    performed_by_role TEXT NOT NULL,
    previous_data JSONB,
    new_data JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. BACKGROUND EVENTS TABLE (Quiet Logged Events)
CREATE TABLE IF NOT EXISTS public.background_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- 'low_stock', 'aging_debt', 'large_expense'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (ROW LEVEL SECURITY) POLICIES
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_events ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON public.products FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for sales" ON public.sales FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for expenses" ON public.expenses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for customer_debts" ON public.customer_debts FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for audit_logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow read access for background_events" ON public.background_events FOR SELECT USING (auth.role() = 'authenticated');

-- Insert policies for staff & authenticated users
CREATE POLICY "Allow insert sales" ON public.sales FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert expenses" ON public.expenses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow insert debts" ON public.customer_debts FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- SEED DATA FOR DEMO / INITIAL SETUP
INSERT INTO public.products (name, price, stock) VALUES
('Bag of Rice (50kg)', 75000.00, 24),
('Vegetable Oil (5L)', 18500.00, 8), -- Low stock sample (threshold = 10)
('Carton of Noodles (Indomie)', 12500.00, 35),
('Sugar (50kg)', 68000.00, 5),  -- Low stock sample
('Tomato Paste (Pack of 50)', 14000.00, 15),
('Refined Milk (Pack of 24)', 22000.00, 4)   -- Low stock sample
ON CONFLICT DO NOTHING;
