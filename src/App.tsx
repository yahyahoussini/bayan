import { Suspense, lazy } from "react";
import { Toaster } from "@/shared/ui/toaster";
import { Toaster as Sonner } from "@/shared/ui/sonner";
import { TooltipProvider } from "@/shared/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary, Header, Footer, VisitorTracker, WhatsAppButton } from "@/shared/components";
import { CartProvider } from "@/features/cart";
import { AdminLayout } from "@/features/admin";

// Lazy load ALL routes for maximum code splitting and performance
const HomePage = lazy(() => import("@/features/home/pages/Index"));
const Boutique = lazy(() => import("@/features/products/pages/Boutique"));
const ProductDetail = lazy(() => import("@/features/products/pages/ProductDetail"));
const Panier = lazy(() => import("@/features/cart/pages/Panier"));
const Confirmation = lazy(() => import("@/features/cart/pages/Confirmation"));
const TrackOrder = lazy(() => import("@/features/orders/pages/TrackOrder"));
const About = lazy(() => import("@/shared/pages/About"));
const Contact = lazy(() => import("@/shared/pages/Contact"));
const Register = lazy(() => import("@/features/auth/pages/Register"));
const AdminLogin = lazy(() => import("@/features/auth/pages/AdminLogin"));
const NotFound = lazy(() => import("@/app/pages/NotFound"));

// Lazy load admin pages for code splitting (reduces initial bundle size)
const AdminDashboard = lazy(() => import("@/features/admin/pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("@/features/admin/pages/admin/AdminOrders"));
const AdminProducts = lazy(() => import("@/features/admin/pages/admin/AdminProducts"));
const AdminCategories = lazy(() => import("@/features/admin/pages/admin/AdminCategories"));
const AdminCoupons = lazy(() => import("@/features/admin/pages/admin/AdminCoupons"));
const AdminReviews = lazy(() => import("@/features/admin/pages/admin/AdminReviews"));
const AdminSettings = lazy(() => import("@/features/admin/pages/admin/AdminSettings"));
const AdminShipping = lazy(() => import("@/features/admin/pages/admin/AdminShipping"));

// Shared loading component for all lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-sm text-muted-foreground">Chargement...</p>
    </div>
  </div>
);

// Optimized QueryClient for high traffic - aggressive caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - cache duration (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnMount: false, // Use cached data if available
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 1, // Only retry once on failure
      retryDelay: 1000, // Wait 1s before retry
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

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
                  {/* Public Routes - All lazy loaded for optimal performance */}
                  <Route path="/" element={
                    <Suspense fallback={<PageLoader />}>
                      <HomePage />
                    </Suspense>
                  } />
                  <Route path="/boutique" element={
                    <Suspense fallback={<PageLoader />}>
                      <Boutique />
                    </Suspense>
                  } />
                  <Route path="/produit/:slug" element={
                    <Suspense fallback={<PageLoader />}>
                      <ProductDetail />
                    </Suspense>
                  } />
                  <Route path="/panier" element={
                    <Suspense fallback={<PageLoader />}>
                      <Panier />
                    </Suspense>
                  } />
                  <Route path="/confirmation/:orderNumber" element={
                    <Suspense fallback={<PageLoader />}>
                      <Confirmation />
                    </Suspense>
                  } />
                  <Route path="/suivre-commande" element={
                    <Suspense fallback={<PageLoader />}>
                      <TrackOrder />
                    </Suspense>
                  } />
                  <Route path="/a-propos" element={
                    <Suspense fallback={<PageLoader />}>
                      <About />
                    </Suspense>
                  } />
                  <Route path="/contact" element={
                    <Suspense fallback={<PageLoader />}>
                      <Contact />
                    </Suspense>
                  } />
                  <Route path="/register" element={
                    <Suspense fallback={<PageLoader />}>
                      <Register />
                    </Suspense>
                  } />
                  
                  {/* Admin Routes - Code split for better performance */}
                  <Route path="/admin/login" element={
                    <Suspense fallback={<PageLoader />}>
                      <AdminLogin />
                    </Suspense>
                  } />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    } />
                    <Route path="orders" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminOrders />
                      </Suspense>
                    } />
                    <Route path="products" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminProducts />
                      </Suspense>
                    } />
                    <Route path="categories" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminCategories />
                      </Suspense>
                    } />
                    <Route path="coupons" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminCoupons />
                      </Suspense>
                    } />
                    <Route path="reviews" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminReviews />
                      </Suspense>
                    } />
                    <Route path="settings" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminSettings />
                      </Suspense>
                    } />
                    <Route path="shipping" element={
                      <Suspense fallback={<PageLoader />}>
                        <AdminShipping />
                      </Suspense>
                    } />
                  </Route>
                  
                  <Route path="*" element={
                    <Suspense fallback={<PageLoader />}>
                      <NotFound />
                    </Suspense>
                  } />
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

