import { Star, Sparkles, Award, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const AboutSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-card via-background to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-8 h-8 text-primary/20 rotate-45">
        <Sparkles className="w-full h-full" />
      </div>
      <div className="absolute bottom-20 right-10 w-6 h-6 text-accent/30 rotate-12">
        <Star className="w-full h-full fill-current" />
      </div>
      <div className="absolute top-1/2 left-20 w-4 h-4 text-primary/15 -rotate-45">
        <Star className="w-full h-full fill-current" />
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Left side - Image collage with decorative elements */}
          <div className="relative">
            {/* Main decorative frame */}
            <div className="relative">
              {/* Background decorative shapes */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-accent to-primary rounded-full opacity-15 blur-2xl"></div>
              
              {/* Decorative geometric shape */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-4 border-primary/30 rounded-2xl rotate-12 z-10"></div>
              
              {/* Main image container */}
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-4 relative">
                  
                  {/* Top left image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                    <img 
                      src="/placeholder.svg" 
                      alt="Femme appliquant un soin visage"
                      className="w-full h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.background = 'linear-gradient(135deg, #f3e8ff, #ede9fe)';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.alt = 'B';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  {/* Top right image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-lg group mt-8">
                    <img 
                      src="/placeholder.svg" 
                      alt="Produits de beauté naturels"
                      className="w-full h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.background = 'linear-gradient(135deg, #fef3c7, #fbbf24)';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.alt = 'C';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  {/* Bottom left image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-lg group -mt-4">
                    <img 
                      src="/placeholder.svg" 
                      alt="Soins luban dakar"
                      className="w-full h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.background = 'linear-gradient(135deg, #dcfce7, #22c55e)';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.alt = 'L';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  
                  {/* Bottom right image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-lg group">
                    <img 
                      src="/placeholder.svg" 
                      alt="Femme souriante avec belle peau"
                      className="w-full h-32 md:h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.background = 'linear-gradient(135deg, #fce7f3, #ec4899)';
                        target.style.display = 'flex';
                        target.style.alignItems = 'center';
                        target.style.justifyContent = 'center';
                        target.alt = 'M';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                </div>

                {/* Central badge */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-600 to-green-700 rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
                    <div className="text-center">
                      <div className="text-xs font-bold text-white leading-none">BAYAN</div>
                      <div className="text-xs text-emerald-100 leading-none">COSMETIC</div>
                    </div>
                    <div className="absolute -inset-1 bg-emerald-400/30 rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {/* Floating decorative elements */}
                <div className="absolute -top-2 right-8 w-6 h-6 text-primary/40 rotate-45">
                  <Star className="w-full h-full fill-current" />
                </div>
                <div className="absolute bottom-4 left-12 w-4 h-4 text-accent/50 -rotate-12">
                  <Sparkles className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="space-y-8 lg:pl-8">
            
            {/* Section header */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Notre Histoire</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Votre Voyage vers une
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Élégance Sans Effort
                </span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Découvrez l'authenticité des soins marocains avec notre gamme exclusive 
                à base de luban dakar. Chaque produit est soigneusement formulé pour 
                révéler votre beauté naturelle et transformer votre routine quotidienne 
                en un moment de pure indulgence.
              </p>
            </div>

            {/* Brand story */}
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Fondée sur la richesse du patrimoine beauté marocain, Bayan Cosmetic 
                s'engage à vous offrir des produits d'exception alliant tradition et innovation. 
                Nos formules exclusives célèbrent la puissance des ingrédients naturels 
                du terroir marocain.
              </p>
              
              <div className="flex items-center gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Certifié Bio</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium">100% Naturel</span>
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div className="border-t border-primary/20 pt-8">
              <div className="text-center">
                <Button
                  onClick={() => navigate('/a-propos')}
                  className="bg-gradient-to-r from-primary to-accent text-white hover:from-accent hover:to-primary transition-all duration-300 px-8 py-4 rounded-full shadow-lg hover:shadow-xl text-lg"
                >
                  Notre Histoire Complète
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
