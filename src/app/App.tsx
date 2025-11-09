import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, Header, Footer, VisitorTracker, WhatsAppButton } from "@/shared/components";
import { CartProvider, Panier, Confirmation } from "@/features/cart";
import { HomePage, AboutSection } from "@/features/home";
import { Boutique, ProductDetail } from "@/features/products";
import { TrackOrder } from "@/features/orders";
import { AdminLogin, Register } from "@/features/auth";
import {
  AdminLayout,
  AdminDashboard,
  AdminOrders,
  AdminProducts,
  AdminCategories,
  AdminCoupons,
  AdminReviews,
  AdminSettings,
  AdminShipping,
} from "@/features/admin";
import About from "@/shared/pages/About";
import Contact from "@/shared/pages/Contact";
import NotFound from "@/app/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true
            }}
          >
            <div className="min-h-screen flex flex-col">
              <VisitorTracker />
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/boutique" element={<Boutique />} />
                  <Route path="/produit/:slug" element={<ProductDetail />} />
                  <Route path="/panier" element={<Panier />} />
                  <Route path="/confirmation/:orderNumber" element={<Confirmation />} />
                  <Route path="/suivre-commande" element={<TrackOrder />} />
                  <Route path="/a-propos" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="coupons" element={<AdminCoupons />} />
                    <Route path="reviews" element={<AdminReviews />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="shipping" element={<AdminShipping />} />
                  </Route>
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
              <WhatsAppButton />
            </div>
          </BrowserRouter>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;








