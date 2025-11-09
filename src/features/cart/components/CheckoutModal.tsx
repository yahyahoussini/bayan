import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { useCart } from '../contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/shared/hooks/useSettings';
import { phoneSchema, nameSchema, addressSchema, sanitizeInput } from '@/shared/lib/validation';
import { logger } from '@/shared/lib/logger';
import { z } from 'zod';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

export function CheckoutModal({ open, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [shippingCities, setShippingCities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    address: '',
    couponCode: '',
  });
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => {
    fetchShippingCities();
  }, []);

  const fetchShippingCities = async () => {
    const { data } = await supabase
      .from('shipping_costs')
      .select('*')
      .eq('is_active', true)
      .order('city_name');
    
    setShippingCities(data || []);
  };

  // Calculate shipping cost based on product-specific costs or city costs (memoized for performance)
  const shippingCost = useMemo(() => {
    if (!formData.city) return 0;
    if (subtotal >= settings.free_shipping_threshold) return 0; // Free shipping threshold from settings
    
    // Check if any product has specific shipping cost
    const productShippingCosts = items
      .filter(item => item.shipping_cost && item.shipping_cost > 0)
      .map(item => item.shipping_cost || 0);
    
    if (productShippingCosts.length > 0) {
      // Use the maximum product shipping cost
      return Math.max(...productShippingCosts);
    }
    
    // Use city-based shipping cost from database
    const city = shippingCities.find(c => c.city_name === formData.city);
    return city?.shipping_cost || 50;
  }, [formData.city, subtotal, items, settings.free_shipping_threshold, shippingCities]);

  const total = useMemo(() => subtotal + shippingCost - discount, [subtotal, shippingCost, discount]);

  const applyCoupon = async () => {
    if (!formData.couponCode) return;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', formData.couponCode.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !coupon) {
      toast.error('❌ Code promo invalide ou expiré');
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      toast.error('❌ Code promo expiré');
      return;
    }

    if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
      toast.error('❌ Ce code promo a atteint sa limite d\'utilisation');
      return;
    }

    if (subtotal < coupon.min_order_amount) {
      toast.error(`⚠️ Commande minimale: ${coupon.min_order_amount} MAD`);
      return;
    }

    const discountAmount = coupon.discount_type === 'percentage'
      ? (subtotal * coupon.discount_value) / 100
      : coupon.discount_value;

    setDiscount(discountAmount);
    setCouponApplied(true);
    toast.success(`✓ Code promo appliqué : -${discountAmount} MAD`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs with Zod schemas
    try {
      const validatedName = nameSchema.parse(sanitizeInput(formData.name));
      const validatedPhone = phoneSchema.parse(formData.phone);
      const validatedAddress = addressSchema.parse(sanitizeInput(formData.address));
      
      if (!formData.city) {
        toast.error('Veuillez sélectionner une ville');
        return;
      }

      setLoading(true);

      // Step 1: Check and reserve stock atomically for all items
      // Note: This requires the decrement_stock database function to be created
      // For now, we'll use the existing check, but recommend implementing the atomic function
      const stockResults = await Promise.all(
        items.map(async (item) => {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('stock_quantity, name')
            .eq('id', item.id)
            .single();

          if (productError) {
            logger.error('Error checking stock', productError, { productId: item.id });
            return { success: false, item, error: productError };
          }

          if (product.stock_quantity < item.quantity) {
            return { success: false, item, error: new Error(`Stock insuffisant: ${product.stock_quantity} disponible`) };
          }

          return { success: true, item };
        })
      );

      // Check if all stock checks succeeded
      const failedStock = stockResults.find(r => !r.success);
      if (failedStock) {
        const errorMsg = failedStock.error instanceof Error 
          ? failedStock.error.message 
          : `Stock insuffisant pour ${failedStock.item.name}`;
        toast.error(`❌ ${errorMsg}`);
        setLoading(false);
        return;
      }

      const orderNumber = `BC-${Date.now()}`;

      // Step 2: Create the order with validated data
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: validatedName,
          customer_phone: validatedPhone,
          customer_city: formData.city,
          customer_address: validatedAddress,
          subtotal,
          shipping_cost: shippingCost,
          discount_amount: discount,
          total_amount: total,
          coupon_code: couponApplied ? formData.couponCode : null,
          status: 'En attente',
          payment_method: 'COD',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Step 3: Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        product_price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Step 4: Reduce stock quantities for each product
      for (const item of items) {
        const { data: currentProduct } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();

        if (currentProduct) {
          const newStock = currentProduct.stock_quantity - item.quantity;
          
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock_quantity: Math.max(0, newStock) })
            .eq('id', item.id);

          if (stockError) {
            logger.error('Error updating stock', stockError, { productId: item.id });
          }
        }
      }

      if (couponApplied && formData.couponCode) {
        const { data: couponData } = await supabase
          .from('coupons')
          .select('used_count')
          .eq('code', formData.couponCode)
          .single();
        
        if (couponData) {
          await supabase
            .from('coupons')
            .update({ used_count: couponData.used_count + 1 })
            .eq('code', formData.couponCode);
        }
      }

      clearCart();
      toast.success('✓ Commande confirmée !');
      navigate(`/confirmation/${orderNumber}`);
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        logger.error('Order creation error', error instanceof Error ? error : new Error(String(error)));
        toast.error('❌ Une erreur est survenue lors de la commande');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[calc(100%-2rem)] sm:w-full rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Finaliser votre commande
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-br from-muted to-muted/50 p-5 rounded-2xl border space-y-3 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Récapitulatif de commande</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                  <span className="font-medium">{item.price * item.quantity} MAD</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 space-y-2 mt-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">{subtotal} MAD</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span className={shippingCost === 0 && subtotal >= settings.free_shipping_threshold ? 'text-green-600 font-semibold' : 'font-medium'}>
                  {shippingCost === 0 && subtotal >= settings.free_shipping_threshold ? 'GRATUIT' : `${shippingCost} MAD`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Réduction</span>
                  <span className="font-semibold">-{discount.toFixed(2)} MAD</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-primary/20">
                <span>Total</span>
                <span className="text-primary">{total.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-base font-semibold">Nom Complet *</Label>
              <Input
                id="name"
                placeholder="Ex: Ahmed Bennani"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={3}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-base font-semibold">Numéro de Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                placeholder="Ex: 0612345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-base font-semibold">Ville *</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Sélectionnez votre ville" />
                </SelectTrigger>
                <SelectContent>
                  {shippingCities.map(city => (
                    <SelectItem key={city.id} value={city.city_name}>
                      {city.city_name} ({city.shipping_cost} MAD)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-base font-semibold">Adresse Complète *</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Rue, numéro, quartier, code postal..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                minLength={10}
                className="resize-none rounded-xl"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg transition-all rounded-xl" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Traitement en cours...
              </span>
            ) : (
              `Confirmer la Commande - ${total.toFixed(2)} MAD`
            )}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="coupon" className="text-base font-semibold">Code Promo (optionnel)</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                placeholder="Entrez votre code"
                value={formData.couponCode}
                onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                disabled={couponApplied}
                className="h-11 rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                onClick={applyCoupon}
                disabled={couponApplied || !formData.couponCode}
                className="h-11 rounded-xl"
              >
                {couponApplied ? '✓ Appliqué' : 'Appliquer'}
              </Button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-muted/80 to-muted/50 p-5 rounded-2xl border text-center space-y-2 shadow-sm">
            <p className="font-semibold text-base">💵 Paiement à la livraison</p>
            <p className="text-sm text-muted-foreground">Vous paierez lors de la réception de votre commande</p>
            <p className="text-sm text-muted-foreground">⏱️ Livraison en 2-3 jours ouvrables</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

