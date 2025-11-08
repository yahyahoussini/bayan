import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/shared/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  description: string | null;
  display_order: number | null;
}

export const CategoriesSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(8);

      if (error) {
        console.warn('Failed to fetch categories, using demo data:', error);
        setDemoCategories();
        return;
      }

      setCategories(data || []);
    } catch (error) {
      console.warn('Network error fetching categories, using demo data:', error);
      setDemoCategories();
    } finally {
      setLoading(false);
    }
  };

  const setDemoCategories = () => {
    setCategories([
      {
        id: '1',
        name: 'Lips Gloss',
        slug: 'lips-gloss',
        image_url: '/placeholder.svg',
        description: 'Brillants à lèvres naturels',
        display_order: 1
      },
      {
        id: '2',
        name: 'Moisturizer',
        slug: 'moisturizer',
        image_url: '/placeholder.svg',
        description: 'Crèmes hydratantes',
        display_order: 2
      },
      {
        id: '3',
        name: 'Eyeliner',
        slug: 'eyeliner',
        image_url: '/placeholder.svg',
        description: 'Eye-liners naturels',
        display_order: 3
      },
      {
        id: '4',
        name: 'Serum',
        slug: 'serum',
        image_url: '/placeholder.svg',
        description: 'Sérums anti-âge',
        display_order: 4
      },
      {
        id: '5',
        name: 'Cleanser',
        slug: 'cleanser',
        image_url: '/placeholder.svg',
        description: 'Nettoyants doux',
        display_order: 5
      },
      {
        id: '6',
        name: 'Perfume',
        slug: 'perfume',
        image_url: '/placeholder.svg',
        description: 'Parfums naturels',
        display_order: 6
      }
    ]);
  };

  const handleCategoryClick = (category: Category) => {
    // Navigate to boutique page with category filter
    navigate(`/boutique?category=${category.slug}`);
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-b from-card via-background to-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Shop By Category</h2>
            <p className="text-xl text-muted-foreground">Découvrez nos collections par catégorie</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col items-center group">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-200 animate-pulse mb-4" />
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="categories-section py-16 px-4 bg-gradient-to-b from-card via-background to-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Shop By Category
          </h2>
          <p className="text-xl text-muted-foreground">
            Découvrez nos collections de produits de beauté
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center max-w-6xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className="flex flex-col items-center group cursor-pointer transform transition-all duration-300 hover:scale-110"
              onClick={() => handleCategoryClick(category)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Category Image Circle */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 mb-4 overflow-hidden rounded-full shadow-lg group-hover:shadow-2xl transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full" />
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center rounded-full">
                    <span className="text-2xl font-bold text-primary">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
                
                {/* Decorative ring */}
                <div className="absolute -inset-2 border-2 border-primary/0 group-hover:border-primary/30 rounded-full transition-all duration-300" />
              </div>

              {/* Category Name */}
              <h3 className={cn(
                "text-center font-semibold text-sm md:text-base transition-all duration-300",
                "group-hover:text-primary group-hover:scale-105",
                "text-gray-700"
              )}>
                {category.name}
              </h3>

              {/* Optional description on hover (for larger screens) */}
              {category.description && (
                <p className="text-xs text-muted-foreground text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block max-w-[120px]">
                  {category.description.length > 50 
                    ? `${category.description.substring(0, 50)}...` 
                    : category.description
                  }
                </p>
              )}

              {/* Animation delay for staggered entrance - using inline style */}
            </div>
          ))}
        </div>

        {/* View All Categories Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/boutique')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl"
          >
            Voir Toutes Les Catégories
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};



