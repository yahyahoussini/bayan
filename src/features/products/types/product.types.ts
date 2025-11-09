export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  long_description?: string;
  price: number;
  stock_quantity: number;
  image_url?: string | null;
  category: string;
  is_active: boolean;
  shipping_cost?: number;
  background_gradient?: string;
  badge_type?: string;
  badge_color?: string;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string | null;
  display_order?: number | null;
}







