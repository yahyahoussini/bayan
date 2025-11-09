import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '../types/product.types';

interface UseProductsOptions {
  category?: string;
  limit?: number;
}

export function useProducts(options?: UseProductsOptions) {
  return useQuery({
    queryKey: ['products', options],
    queryFn: async () => {
      // Optimized: Select only needed columns for better performance
      let query = supabase
        .from('products')
        .select('id, name, slug, description, price, image_url, stock_quantity, category, badge_type, background_gradient, size')
        .eq('is_active', true);
      
      if (options?.category) {
        query = query.eq('category', options.category);
      }
      
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}







