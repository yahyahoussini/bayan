import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Leaf, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import { CategoriesSection } from '@/components/CategoriesSection';
import { AboutSection } from '@/components/AboutSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { supabase } from '@/integrations/supabase/client';
import pinkRose from '@/assets/pink-rose.webp';
import topBg from '@/assets/top-bg.webp';
import { sanitizeHtml } from '@/lib/sanitize';

export default function Index() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    fetchFeaturedProduct();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .limit(4);

      if (error) {
        console.warn('Failed to fetch products, using demo data:', error);
        setDemoProducts();
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.warn('Network error fetching products, using demo data:', error);
      setDemoProducts();
    }
  };

  const fetchFeaturedProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', 'gel-nettoyant')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.warn('Featured product not found, using default data:', error);
        setFeaturedProduct({
          name: 'Nettoyage en profondeur',
          price: 220,
          description: 'Nos produits entièrement naturels sont conçus pour améliorer votre éclat naturel, nourrissant votre peau, vos cheveux et votre corps avec les ingrédients les plus purs. Laissez votre essence rayonner avec la puissance de la nature, alors que nous révélons le meilleur de vous, naturellement et sans effort.',
          image_url: null
        });
        return;
      }

      setFeaturedProduct(data);
    } catch (error) {
      console.warn('Network error fetching featured product, using default data:', error);
      setFeaturedProduct({
        name: 'Nettoyage en profondeur',
        price: 220,
        description: 'Nos produits entièrement naturels sont conçus pour améliorer votre éclat naturel, nourrissant votre peau, vos cheveux et votre corps avec les ingrédients les plus purs. Laissez votre essence rayonner avec la puissance de la nature, alors que nous révélons le meilleur de vous, naturellement et sans effort.',
        image_url: null
      });
    }
  };

  const setDemoProducts = () => {
    setProducts([
      {
        id: '1',
        name: 'Sérum Luban Dakar Premium',
        price: 299,
        description: 'Sérum anti-âge à base de luban dakar authentique',
        image_url: '/placeholder.svg',
        category: 'Sérums',
        is_active: true
      },
      {
        id: '2', 
        name: 'Crème Hydratante Argan Bio',
        price: 199,
        description: 'Crème hydratante enrichie à l\'huile d\'argan',
        image_url: '/placeholder.svg',
        category: 'Hydratants',
        is_active: true
      },
      {
        id: '3',
        name: 'Gommage Rose & Miel',
        price: 149,
        description: 'Gommage doux aux pétales de rose',
        image_url: '/placeholder.svg',
        category: 'Gommages',
        is_active: true
      },
      {
        id: '4',
        name: 'Huile Précieuse Multi-Usage',
        price: 249,
        description: 'Huile naturelle pour visage et corps',
        image_url: '/placeholder.svg', 
        category: 'Huiles',
        is_active: true
      }
    ]);
  };


  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <section className="relative py-32 md:py-40 px-4 text-center overflow-hidden">
        {/* Decorative flower in hero */}
        <div className="absolute top-12 right-4 md:right-8 w-16 h-16 md:w-32 md:h-32 opacity-40 pointer-events-none animate-float">
          <img 
            src={pinkRose} 
            alt="" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        <div className="absolute bottom-20 left-4 md:left-12 w-14 h-14 md:w-24 md:h-24 opacity-35 pointer-events-none animate-float-delayed">
          <img 
            src={pinkRose} 
            alt="" 
            className="w-full h-full object-contain drop-shadow-xl transform rotate-45"
          />
        </div>

        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={topBg} 
            alt="Beauté naturelle marocaine"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
          {/* Color overlay for brand colors */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 mix-blend-overlay"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto max-w-4xl relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
            Beauté Naturelle Marocaine
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg font-medium">
            Soins à base de luban dakar pour une peau radieuse
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-primary hover:text-white text-lg px-8 py-6 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 font-semibold border-2 border-white"
            onClick={() => navigate('/boutique')}
          >
            Découvrir Nos Produits
          </Button>
        </div>

        {/* Decorative bottom wave with smooth gradient transition */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--background))" stopOpacity="0" />
                <stop offset="50%" stopColor="hsl(var(--background))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--background))" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="url(#waveGradient)" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-white via-card to-card relative overflow-hidden">
        {/* Decorative flowers in features section */}
        <div className="absolute top-8 right-4 md:right-8 w-12 h-12 md:w-20 md:h-20 opacity-40 pointer-events-none animate-float">
          <img 
            src={pinkRose} 
            alt="" 
            className="w-full h-full object-contain drop-shadow-xl"
          />
        </div>
        <div className="absolute bottom-8 left-4 md:left-12 w-10 h-10 md:w-16 md:h-16 opacity-30 pointer-events-none animate-float-delayed">
          <img 
            src={pinkRose} 
            alt="" 
            className="w-full h-full object-contain drop-shadow-lg transform -rotate-30"
          />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div className="text-center p-3 md:p-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Leaf className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2">100% Naturel</h3>
              <p className="text-xs md:text-base text-muted-foreground">Ingrédients naturels soigneusement sélectionnés</p>
            </div>
            <div className="text-center p-3 md:p-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2">Ingrédients Marocains</h3>
              <p className="text-xs md:text-base text-muted-foreground">Luban Dakar et huile d'argan authentiques</p>
            </div>
            <div className="text-center p-3 md:p-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              </div>
              <h3 className="text-sm md:text-xl font-bold mb-1 md:mb-2">Certifié Bio</h3>
              <p className="text-xs md:text-base text-muted-foreground">Qualité garantie et contrôlée</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoriesSection />

      {/* Products Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-card via-white to-white relative overflow-hidden">
        {/* Decorative flowers in products section */}
        <div className="absolute top-12 left-4 md:left-8 w-12 h-12 md:w-16 md:h-16 opacity-30 pointer-events-none animate-float">
          <img 
            src={pinkRose} 
            alt="" 
            className="w-full h-full object-contain drop-shadow-lg transform rotate-90"
          />
        </div>
        <div className="absolute top-20 right-4 md:right-16 w-14 h-14 md:w-20 md:h-20 opacity-35 pointer-events-none animate-float-delayed">
          <img 
            src={pinkRose} 
            alt="" 
            className="w-full h-full object-contain drop-shadow-xl transform -rotate-15"
          />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Nos Produits Vedettes</h2>
            <p className="text-xl text-muted-foreground">Découvrez notre collection de soins naturels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                {...product}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              variant="outline"
              className="border-2"
              onClick={() => navigate('/boutique')}
            >
              Voir Tous Les Produits
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Product Section */}
      <section className="py-20 md:py-32 px-4 bg-gradient-to-b from-white via-[#faf9f7] to-[#faf9f7] relative overflow-hidden">
        {/* Decorative leaf in top right */}
        <div className="absolute top-8 right-8 w-16 h-16 md:w-24 md:h-24 opacity-20 pointer-events-none hidden md:block">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M50 20 Q30 30 20 50 Q30 70 50 80 Q70 70 80 50 Q70 30 50 20 Z" fill="#4a7c59" opacity="0.3"/>
            <path d="M50 25 Q35 33 27 50 Q35 67 50 75 Q65 67 73 50 Q65 33 50 25 Z" fill="#6b8e5a" opacity="0.2"/>
          </svg>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Visual Elements */}
            <div className="relative flex items-center justify-center min-h-[400px] md:min-h-[500px]">
              {/* Background Circle */}
              <div className="absolute w-64 h-64 md:w-80 md:h-80 bg-[#a8b89a] rounded-full opacity-30 blur-3xl -left-8 -top-8"></div>
              
              {/* Product Image Container */}
              <div className="relative z-10 flex items-center justify-center">
                {/* Decorative Elements */}
                <div className="absolute -left-8 md:-left-12 bottom-20 w-16 h-16 md:w-20 md:h-20 opacity-60">
                  <div className="w-full h-full bg-white rounded-full shadow-lg flex items-center justify-center">
                    <Leaf className="w-8 h-8 md:w-10 md:h-10 text-[#6b8e5a]" />
                  </div>
                </div>
                
                {/* Main Product Image */}
                <div className="relative z-20">
                  {featuredProduct?.image_url ? (
                    <img 
                      src={featuredProduct.image_url} 
                      alt={featuredProduct.name}
                      className="w-48 h-64 md:w-64 md:h-80 object-contain rounded-lg shadow-2xl"
                    />
                  ) : (
                    <div className="w-48 h-64 md:w-64 md:h-80 bg-gradient-to-b from-[#d4a574] to-[#8b6f47] rounded-lg shadow-2xl flex items-center justify-center">
                      <div className="text-center p-6">
                        <div className="w-32 h-40 md:w-44 md:h-56 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                          <span className="text-white/80 text-xs md:text-sm font-semibold">Produit</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Decorative Stones */}
                <div className="absolute -right-8 md:-right-12 top-32 flex flex-col gap-2 opacity-70">
                  <div className="w-12 h-8 md:w-16 md:h-10 bg-gray-300 rounded-full"></div>
                  <div className="w-14 h-10 md:w-18 md:h-12 bg-gray-300 rounded-full"></div>
                  <div className="w-10 h-8 md:w-14 md:h-10 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Right Side - Text Content */}
            <div className="space-y-6 md:space-y-8">
              <div>
                <p className="text-sm md:text-base text-[#6b6b6b] font-medium mb-2">
                  {featuredProduct?.name || 'Nettoyage en profondeur'}
                </p>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-[#2d2d2d] mb-6 leading-tight">
                  Élevez Votre Essence & Nourrissez Votre Corps
                </h2>
                <div 
                  className="text-base md:text-lg text-[#6b6b6b] leading-relaxed max-w-lg"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(featuredProduct?.description || featuredProduct?.long_description || 'Nos produits entièrement naturels sont conçus pour améliorer votre éclat naturel, nourrissant votre peau, vos cheveux et votre corps avec les ingrédients les plus purs. Laissez votre essence rayonner avec la puissance de la nature, alors que nous révélons le meilleur de vous, naturellement et sans effort.')
                  }}
                />
              </div>
              
              <div className="flex items-baseline gap-4">
                <p className="text-3xl md:text-4xl font-bold text-[#2d2d2d]">
                  {featuredProduct?.price || 220} MAD
                </p>
              </div>

              <Button
                size="lg"
                className="bg-[#6b8e5a] hover:bg-[#5a7a4a] text-white px-8 py-6 text-base md:text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/produit/gel-nettoyant')}
              >
                Voir la Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* About Us Section */}
      <AboutSection />
    </div>
  );
}