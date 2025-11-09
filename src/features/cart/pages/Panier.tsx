import { useState } from 'react';
import { Trash2, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { CheckoutModal } from '../components/CheckoutModal';

export default function Panier() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const shippingThreshold = 500;
  const remainingForFreeShipping = Math.max(0, shippingThreshold - subtotal);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Panier Icon at Top */}
        <div className="w-full py-8 px-4 flex justify-center">
          <ShoppingCart className="w-16 h-16 text-muted" />
        </div>
        
        {/* Centered Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <ShoppingBag className="w-24 h-24 text-muted mb-6" />
          <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-muted-foreground mb-8">Découvrez nos produits de beauté naturels</p>
          <Button size="lg" onClick={() => navigate('/boutique')}>
            Continuer vos achats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card p-4 md:p-6 rounded-lg">
                {/* Product Name */}
                <h3 className="font-bold text-base md:text-lg mb-3">{item.name}</h3>
                
                {/* Quantity, Price, and Delete Row */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  {/* Quantity Selector */}
                  <div className="flex items-center bg-accent/10 rounded-full px-2 py-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent/20"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </Button>
                    <span className="px-3 md:px-4 font-semibold text-sm md:text-base min-w-[2rem] text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-accent/20"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>

                  {/* Price and Delete Icon - Properly Aligned */}
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-base md:text-lg whitespace-nowrap">{item.price} MAD</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:text-destructive h-8 w-8 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </div>
                </div>

                {/* Volume */}
                <p className="text-sm text-muted-foreground mb-2">{item.size}</p>

                {/* Item Total */}
                <p className="text-base md:text-lg font-bold">{item.price * item.quantity} MAD</p>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-lg sticky top-24 space-y-4">
              <h2 className="text-2xl font-bold mb-4">Récapitulatif</h2>

              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span className="font-semibold">{subtotal} MAD</span>
                </div>
                <div className="flex justify-between">
                  <span>Frais de livraison</span>
                  <span className={remainingForFreeShipping === 0 ? 'text-success font-semibold' : ''}>
                    {remainingForFreeShipping === 0 ? 'GRATUIT' : 'Calculé au checkout'}
                  </span>
                </div>
              </div>

              {remainingForFreeShipping > 0 && (
                <p className="text-sm text-muted-foreground">
                  Plus que <span className="font-bold text-accent">{remainingForFreeShipping} MAD</span> pour la livraison gratuite !
                </p>
              )}

              <div className="flex justify-between text-xl font-bold pt-4 border-t">
                <span>Total</span>
                <span>{subtotal} MAD</span>
              </div>

              <Button
                size="lg"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setCheckoutOpen(true)}
              >
                Passer la Commande
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                💵 Paiement à la livraison disponible ✓
              </p>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
      />
    </div>
  );
}







