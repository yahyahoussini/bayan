import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSEO } from '@/hooks/useSEO';
import { generateBreadcrumbStructuredData, BASE_URL } from '@/lib/seo';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Boutique() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('none');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    
    // Check if there's a category parameter in the URL
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy, searchQuery, priceRange]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }

    setCategories(data || []);
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const selectedCat = categories.find(c => c.slug === selectedCategory || c.id === selectedCategory);
      if (selectedCat) {
        filtered = filtered.filter(p => 
          p.category === selectedCat.name || 
          p.category === selectedCat.slug ||
          p.category === selectedCat.id
        );
      }
    }

    // Price range filter
    if (priceRange.min) {
      const minPrice = parseFloat(priceRange.min);
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(p => p.price >= minPrice);
      }
    }
    if (priceRange.max) {
      const maxPrice = parseFloat(priceRange.max);
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(p => p.price <= maxPrice);
      }
    }

    // Sort
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'name_desc') {
      filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    }
    // If sortBy is 'none', no sorting is applied

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('none');
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = selectedCategory !== 'all' || sortBy !== 'none' || priceRange.min !== '' || priceRange.max !== '';

  // SEO Configuration
  const selectedCategoryName = categories.find(c => c.slug === selectedCategory)?.name || '';
  const pageTitle = selectedCategory && selectedCategory !== 'all'
    ? `${selectedCategoryName} - Boutique Bayan Cosmetic`
    : 'Boutique - Produits de beauté naturels marocains | Bayan Cosmetic';
  
  const pageDescription = selectedCategory && selectedCategory !== 'all'
    ? `Découvrez notre collection de ${selectedCategoryName.toLowerCase()} - Produits de beauté naturels marocains de qualité.`
    : 'Parcourez notre boutique en ligne de produits de beauté naturels marocains. Découvrez notre sélection de soins naturels pour la peau, les cheveux et le corps.';

  const { HelmetSEO } = useSEO({
    title: pageTitle,
    description: pageDescription,
    keywords: `boutique produits beauté, ${selectedCategoryName}, cosmétiques marocains, soins naturels, produits beauté en ligne`,
    image: '/assets/logo.png',
    url: `${BASE_URL}/boutique${selectedCategory && selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`,
    type: 'website',
    structuredData: [
      generateBreadcrumbStructuredData([
        { name: 'Accueil', url: '/' },
        { name: 'Boutique', url: '/boutique' },
        ...(selectedCategory && selectedCategory !== 'all' ? [{ name: selectedCategoryName, url: `/boutique?category=${selectedCategory}` }] : [])
      ])
    ]
  });

  return (
    <>
      <HelmetSEO />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Notre Boutique
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Découvrez notre collection de produits de beauté naturels
          </p>
        </div>

        {/* Search Bar with Filter Icon */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-24 h-14 text-base rounded-full border-2 focus:border-primary transition-colors"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterOpen(true)}
                className={`absolute right-2 h-10 w-10 rounded-full ${
                  hasActiveFilters ? 'bg-primary text-primary-foreground' : ''
                }`}
                aria-label="Ouvrir les filtres"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-2xl mx-auto">
              <span className="text-sm text-muted-foreground">Filtres actifs:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {categories.find(c => c.slug === selectedCategory || c.id === selectedCategory)?.name || selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'none' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {sortBy === 'price_asc' && 'Prix croissant'}
                  {sortBy === 'price_desc' && 'Prix décroissant'}
                  {sortBy === 'name_asc' && 'Nom A-Z'}
                  {sortBy === 'name_desc' && 'Nom Z-A'}
                  <button
                    onClick={() => setSortBy('none')}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(priceRange.min || priceRange.max) && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {priceRange.min && priceRange.max
                    ? `${priceRange.min} - ${priceRange.max} MAD`
                    : priceRange.min
                    ? `À partir de ${priceRange.min} MAD`
                    : `Jusqu'à ${priceRange.max} MAD`}
                  <button
                    onClick={() => setPriceRange({ min: '', max: '' })}
                    className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-sm h-7"
              >
                Effacer tout
              </Button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">
            {filteredProducts.length === 0 ? (
              'Aucun produit trouvé'
            ) : filteredProducts.length === 1 ? (
              '1 produit trouvé'
            ) : (
              `${filteredProducts.length} produits trouvés`
            )}
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
            />
          ))}
        </div>

        {/* Filter Dialog */}
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">Filtres</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 mt-4">
              {/* Category Filter */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Catégorie</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug || cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Prix (MAD)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="min-price" className="text-sm text-muted-foreground">
                      Prix minimum
                    </Label>
                    <Input
                      id="min-price"
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-price" className="text-sm text-muted-foreground">
                      Prix maximum
                    </Label>
                    <Input
                      id="max-price"
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Filter */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Trier par</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Aucun tri" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun tri</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                    <SelectItem value="name_asc">Nom A-Z</SelectItem>
                    <SelectItem value="name_desc">Nom Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="flex-1 rounded-xl"
                >
                  Réinitialiser
                </Button>
                <Button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Appliquer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
    </>
  );
}
