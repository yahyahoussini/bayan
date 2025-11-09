import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, MessageCircle, Minus, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useCart, CheckoutModal } from '@/features/cart';
import { toast } from 'sonner';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/shared/ui/carousel';
import { useSettings } from '@/shared/hooks/useSettings';
import { sanitizeHtml } from '@/shared/lib/sanitize';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { settings } = useSettings();
  const [product, setProduct] = useState<any>(null);
  const [productMedia, setProductMedia] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product?.id) {
      fetchReviews();
      fetchVariants();
    }
  }, [product?.id]);

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      toast.error('Produit non trouvé');
      navigate('/boutique');
      return;
    }

    setProduct(data);
    
    // Fetch product media
    const { data: mediaData } = await supabase
      .from('product_media')
      .select('*')
      .eq('product_id', data.id)
      .order('display_order', { ascending: true });
    
    if (mediaData) {
      setProductMedia(mediaData);
    }
    
    setLoading(false);
  };

  const fetchReviews = async () => {
    if (!product?.id) return;
    
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
    }
  };

  const fetchVariants = async () => {
    if (!product?.id) return;

    try {
      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('display_order');

      if (variantsError) throw variantsError;

      const variantsWithOptions = await Promise.all(
        (variantsData || []).map(async (variant) => {
          const { data: options } = await supabase
            .from('product_variant_options')
            .select('*')
            .eq('variant_id', variant.id)
            .eq('is_active', true)
            .order('display_order');

          return { ...variant, options: options || [] };
        })
      );

      setVariants(variantsWithOptions);
      
      // Initialize selected variants with first option for each variant
      const initialSelections: Record<string, string> = {};
      variantsWithOptions.forEach((variant) => {
        if (variant.options.length > 0) {
          initialSelections[variant.id] = variant.options[0].id;
        }
      });
      setSelectedVariants(initialSelections);
    } catch (error) {
      console.error('Error fetching variants:', error);
    }
  };

  // Memoized price calculation for performance
  const finalPrice = useMemo(() => {
    let price = product?.price || 0;
    
    Object.values(selectedVariants).forEach((optionId) => {
      variants.forEach((variant) => {
        const option = variant.options.find((opt: any) => opt.id === optionId);
        if (option && option.price_modifier) {
          price += option.price_modifier;
        }
      });
    });
    
    return price;
  }, [product?.price, selectedVariants, variants]);

  const getSelectedVariantStock = () => {
    // If no variants, return product stock
    if (variants.length === 0) {
      return product?.stock_quantity || 0;
    }

    // Find the selected option and return its stock
    for (const optionId of Object.values(selectedVariants)) {
      for (const variant of variants) {
        const option = variant.options.find((opt: any) => opt.id === optionId);
        if (option) {
          return option.stock_quantity || 0;
        }
      }
    }

    return product?.stock_quantity || 0;
  };

  if (loading || !product) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const handleAddToCart = () => {
    const stock = getSelectedVariantStock();
    if (stock <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    // Check if required variants are selected
    const requiredVariants = variants.filter(v => v.is_required);
    for (const variant of requiredVariants) {
      if (!selectedVariants[variant.id]) {
        toast.error(`Veuillez sélectionner une option pour ${variant.variant_name}`);
        return;
      }
    }

    // finalPrice is already memoized above
    
    // Build variant name string for cart
    const variantNames: string[] = [];
    Object.entries(selectedVariants).forEach(([variantId, optionId]) => {
      const variant = variants.find(v => v.id === variantId);
      if (variant) {
        const option = variant.options.find((opt: any) => opt.id === optionId);
        if (option) {
          variantNames.push(`${variant.variant_name}: ${option.option_name}`);
        }
      }
    });
    const variantString = variantNames.length > 0 ? ` (${variantNames.join(', ')})` : '';

    addItem({ 
      id: product.id, 
      name: `${product.name}${variantString}`, 
      price: finalPrice, 
      quantity, 
      size: product.size,
      shipping_cost: product.shipping_cost 
    });
    toast.success('✓ Produit ajouté au panier avec succès !');
  };

  const handleBuyNow = () => {
    const stock = getSelectedVariantStock();
    if (stock <= 0) {
      toast.error('Produit en rupture de stock');
      return;
    }

    // Check if required variants are selected
    const requiredVariants = variants.filter(v => v.is_required);
    for (const variant of requiredVariants) {
      if (!selectedVariants[variant.id]) {
        toast.error(`Veuillez sélectionner une option pour ${variant.variant_name}`);
        return;
      }
    }

    // finalPrice is already memoized above
    
    // Build variant name string for cart
    const variantNames: string[] = [];
    Object.entries(selectedVariants).forEach(([variantId, optionId]) => {
      const variant = variants.find(v => v.id === variantId);
      if (variant) {
        const option = variant.options.find((opt: any) => opt.id === optionId);
        if (option) {
          variantNames.push(`${variant.variant_name}: ${option.option_name}`);
        }
      }
    });
    const variantString = variantNames.length > 0 ? ` (${variantNames.join(', ')})` : '';

    addItem({ 
      id: product.id, 
      name: `${product.name}${variantString}`, 
      price: finalPrice, 
      quantity, 
      size: product.size,
      shipping_cost: product.shipping_cost 
    });
    setCheckoutOpen(true);
  };

  const handleWhatsApp = () => {
    // finalPrice is already memoized above
    const variantNames: string[] = [];
    Object.entries(selectedVariants).forEach(([variantId, optionId]) => {
      const variant = variants.find(v => v.id === variantId);
      if (variant) {
        const option = variant.options.find((opt: any) => opt.id === optionId);
        if (option) {
          variantNames.push(`${variant.variant_name}: ${option.option_name}`);
        }
      }
    });
    const variantString = variantNames.length > 0 ? ` (${variantNames.join(', ')})` : '';
    const message = encodeURIComponent(`Bonjour, je suis intéressé(e) par ${product.name}${variantString} - ${finalPrice.toFixed(2)} MAD`);
    window.open(`https://wa.me/${settings.whatsapp_number}?text=${message}`, '_blank');
  };

  const images = productMedia.filter(m => m.media_type === 'image');
  const videos = productMedia.filter(m => m.media_type === 'video');

  const scrollToCTA = () => {
    document.getElementById('cta-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen py-4 lg:py-12 px-4 pb-24 lg:pb-12">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Left: Image/Video Gallery */}
          <div className="space-y-4">
            {(images.length > 0 || videos.length > 0) ? (
              <>
                {/* Main media carousel - images and videos combined */}
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent>
                    {images.map((media, index) => (
                      <CarouselItem key={`img-${media.id}`}>
                        <div className="rounded-lg overflow-hidden aspect-square lg:aspect-auto lg:min-h-[500px]">
                          <img
                            src={media.media_url}
                            alt={`${product.name} - Image ${index + 1} - Produit de beauté naturel`}
                            className="w-full h-full object-cover"
                            loading={index === 0 ? "eager" : "lazy"}
                          />
                        </div>
                      </CarouselItem>
                    ))}
                    {videos.map((media, index) => (
                      <CarouselItem key={`vid-${media.id}`}>
                        <div className="rounded-lg overflow-hidden aspect-square lg:aspect-auto lg:min-h-[500px]">
                          <video
                            src={media.media_url}
                            poster={product.image_url || images[0]?.media_url}
                            controls
                            muted
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
                
                {/* Thumbnail gallery */}
                {(images.length + videos.length) > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((media, index) => (
                      <img
                        key={`thumb-img-${media.id}`}
                        src={media.media_url}
                        alt={product.name}
                        className={`w-full h-16 lg:h-20 object-cover rounded cursor-pointer border-2 ${
                          media.is_primary ? 'border-primary' : 'border-border'
                        } hover:border-primary transition-colors`}
                      />
                    ))}
                    {videos.map((media, index) => (
                      <div
                        key={`thumb-vid-${media.id}`}
                        className="relative w-full h-16 lg:h-20 rounded cursor-pointer border-2 border-border hover:border-primary transition-colors overflow-hidden"
                      >
                        <img
                          src={product.image_url || images[0]?.media_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div
                className="rounded-lg p-12 flex items-center justify-center"
                style={{ background: product.background_gradient, minHeight: '500px' }}
              >
                <Badge className="absolute top-4 left-4 bg-card text-card-foreground border-border">
                  {product.badge_type}
                </Badge>
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                  <p className="text-lg text-muted-foreground">{product.size}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="space-y-4 lg:space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 lg:w-5 lg:h-5 ${
                      i < Math.floor(product.rating || 4.5) 
                        ? 'fill-accent text-accent' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                ))}
                <span className="text-xs lg:text-sm text-muted-foreground">({product.rating || 4.5})</span>
              </div>
              <p className="text-3xl lg:text-5xl font-bold mb-2">
                {finalPrice.toFixed(2)} MAD
                {finalPrice !== product.price && (
                  <span className="text-lg lg:text-xl text-muted-foreground line-through ml-2">
                    {product.price} MAD
                  </span>
                )}
              </p>
              <div 
                className="text-base lg:text-lg text-muted-foreground mb-4 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
              />
              
              {/* Product Variants */}
              {variants.length > 0 && (
                <div className="space-y-4 mb-4">
                  {variants.map((variant) => (
                    <div key={variant.id} className="space-y-2">
                      <Label htmlFor={`variant-${variant.id}`} className="text-sm font-semibold">
                        {variant.variant_name}
                        {variant.is_required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Select
                        value={selectedVariants[variant.id] || ''}
                        onValueChange={(value) => {
                          setSelectedVariants(prev => ({ ...prev, [variant.id]: value }));
                        }}
                      >
                        <SelectTrigger id={`variant-${variant.id}`}>
                          <SelectValue placeholder={`Sélectionner ${variant.variant_name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {variant.options.map((option: any) => (
                            <SelectItem 
                              key={option.id} 
                              value={option.id}
                              disabled={option.stock_quantity === 0}
                            >
                              {option.option_name}
                              {option.price_modifier > 0 && (
                                <span className="text-muted-foreground ml-2">
                                  (+{option.price_modifier.toFixed(2)} MAD)
                                </span>
                              )}
                              {option.stock_quantity === 0 && (
                                <span className="text-destructive ml-2">(Rupture de stock)</span>
                              )}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs lg:text-sm">
                Stock disponible: <span className={`font-semibold ${
                  getSelectedVariantStock() === 0 ? 'text-destructive' : 
                  getSelectedVariantStock() <= 10 ? 'text-orange-500' : 
                  'text-success'
                }`}>
                  {getSelectedVariantStock() === 0 ? 'Rupture de stock' : `${getSelectedVariantStock()} unités`}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-full">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-l-full h-9 w-9 lg:h-10 lg:w-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
                <span className="px-4 lg:px-6 font-semibold text-sm lg:text-base">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-r-full h-9 w-9 lg:h-10 lg:w-10"
                  onClick={() => setQuantity(Math.min(getSelectedVariantStock(), quantity + 1))}
                >
                  <Plus className="w-3 h-3 lg:w-4 lg:h-4" />
                </Button>
              </div>
            </div>

            <div id="cta-section" className="space-y-2 lg:space-y-3">
              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-11 lg:h-12 text-sm lg:text-base"
                onClick={handleBuyNow}
                disabled={getSelectedVariantStock() <= 0}
              >
                Acheter Maintenant
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full h-11 lg:h-12 text-sm lg:text-base"
                onClick={handleAddToCart}
                disabled={getSelectedVariantStock() <= 0}
              >
                <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                {getSelectedVariantStock() <= 0 ? 'Rupture de stock' : 'Ajouter au Panier'}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white h-11 lg:h-12 text-sm lg:text-base"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
                Commander via WhatsApp
              </Button>
            </div>

            {/* Description Section */}
            <div className="mt-6 lg:mt-8 space-y-3 lg:space-y-4">
              <h2 className="text-xl lg:text-2xl font-bold uppercase tracking-wide">DESCRIPTION</h2>
              <div 
                className="text-sm lg:text-base text-muted-foreground leading-relaxed prose prose-sm lg:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.long_description || product.description) }}
              />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 lg:mt-12">
          <Tabs defaultValue="ingredients">
            <TabsList className="grid w-full grid-cols-3 h-auto gap-1">
              <TabsTrigger value="ingredients" className="text-[10px] sm:text-xs lg:text-sm px-1 lg:px-3">Ingrédients</TabsTrigger>
              <TabsTrigger value="benefits" className="text-[10px] sm:text-xs lg:text-sm px-1 lg:px-3">Bienfaits</TabsTrigger>
              <TabsTrigger value="usage" className="text-[10px] sm:text-xs lg:text-sm px-1 lg:px-3">Mode d'emploi</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients" className="mt-4 lg:mt-6">
              <ul className="space-y-2">
                {product.ingredients?.map((ingredient: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm lg:text-base">
                    <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="benefits" className="mt-4 lg:mt-6">
              <ul className="space-y-2">
                {product.benefits?.map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm lg:text-base">
                    <span className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="usage" className="mt-4 lg:mt-6">
              <div 
                className="text-sm lg:text-lg prose prose-sm lg:prose-base max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.usage_instructions) }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-12 lg:mt-16">
          <h2 className="text-2xl lg:text-3xl font-bold mb-6 lg:mb-8 text-center">Avis Clients</h2>
          
          {/* Reviews Display */}
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
              {reviews.map((review) => (
                <Card key={review.id} className="border-border">
                  <CardContent className="pt-4 lg:pt-6">
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 lg:w-4 lg:h-4 ${
                            i < review.rating 
                              ? 'fill-accent text-accent' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs lg:text-sm mb-3">{review.comment}</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-xs lg:text-sm">{review.customer_name}</p>
                      {review.is_verified && (
                        <Badge variant="secondary" className="text-xs">Achat vérifié</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Button to show review form */}
          {!showReviewForm && (
            <div className="text-center mb-8">
              <Button 
                onClick={() => setShowReviewForm(true)}
                size="lg"
                className="bg-accent hover:bg-accent/90"
              >
                Laisser un avis
              </Button>
            </div>
          )}

          {/* Review Submission Form */}
          {showReviewForm && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl lg:text-2xl font-bold">Laisser un avis</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowReviewForm(false)}
                  >
                    Fermer
                  </Button>
                </div>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const name = formData.get('name') as string;
                  const rating = parseInt(formData.get('rating') as string);
                  const comment = formData.get('comment') as string;

                  if (!name || !rating || !comment) {
                    toast.error('Veuillez remplir tous les champs');
                    return;
                  }

                  const { error } = await supabase.from('reviews').insert({
                    product_id: product.id,
                    customer_name: name,
                    rating,
                    comment,
                    is_approved: false,
                    is_verified: false,
                  });

                  if (error) {
                    toast.error('Erreur lors de l\'envoi de l\'avis');
                    return;
                  }

                  toast.success('Votre avis a été soumis et sera publié après approbation');
                  e.currentTarget.reset();
                  setShowReviewForm(false);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Votre nom *</Label>
                    <Input id="name" name="name" required className="mt-1" />
                  </div>

                  <div>
                    <Label htmlFor="rating">Note *</Label>
                    <select 
                      id="rating" 
                      name="rating" 
                      required 
                      className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Sélectionnez une note</option>
                      <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                      <option value="4">⭐⭐⭐⭐ Très bien</option>
                      <option value="3">⭐⭐⭐ Bien</option>
                      <option value="2">⭐⭐ Moyen</option>
                      <option value="1">⭐ Décevant</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="comment">Votre avis *</Label>
                    <Textarea 
                      id="comment" 
                      name="comment" 
                      required 
                      rows={4} 
                      className="mt-1"
                      placeholder="Partagez votre expérience avec ce produit..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
                    Envoyer mon avis
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Votre avis sera publié après vérification par notre équipe
                  </p>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />

      {/* Mobile Fixed Bottom Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-50">
        <Button
          size="lg"
          className="w-full max-w-md mx-auto bg-accent hover:bg-accent/90 text-accent-foreground h-12"
          onClick={scrollToCTA}
        >
          Voir les options d'achat
        </Button>
      </div>
    </div>
    </>
  );
}