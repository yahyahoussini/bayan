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
      let query = supabase
        .from('products')
        .select('*')
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
  });
}



