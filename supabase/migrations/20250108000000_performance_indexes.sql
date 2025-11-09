-- Performance indexes for high traffic optimization
-- These indexes significantly improve query performance under load

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_active_category ON public.products(is_active, category) WHERE is_active = true;

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_is_approved ON public.reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON public.reviews(product_id, is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Coupons indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_expires_at ON public.coupons(expires_at);

-- Shipping costs indexes
CREATE INDEX IF NOT EXISTS idx_shipping_costs_city_name ON public.shipping_costs(city_name);
CREATE INDEX IF NOT EXISTS idx_shipping_costs_is_active ON public.shipping_costs(is_active);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_display_order ON public.product_variants(display_order);

-- Product variant options indexes
CREATE INDEX IF NOT EXISTS idx_variant_options_variant_id ON public.product_variant_options(variant_id);
CREATE INDEX IF NOT EXISTS idx_variant_options_is_active ON public.product_variant_options(is_active);
CREATE INDEX IF NOT EXISTS idx_variant_options_display_order ON public.product_variant_options(display_order);

-- Product media indexes
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_display_order ON public.product_media(display_order);

-- Settings indexes (if settings table exists)
-- CREATE INDEX IF NOT EXISTS idx_settings_key ON public.settings(key);

-- Comments on indexes for documentation
COMMENT ON INDEX idx_products_active_category IS 'Composite index for filtering active products by category - critical for boutique page performance';
COMMENT ON INDEX idx_reviews_product_approved IS 'Composite index for fetching approved reviews by product - critical for product detail page';


