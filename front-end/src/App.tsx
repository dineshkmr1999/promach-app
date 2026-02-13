import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/ThemeProvider";
import FloatingAssistant from "@/components/FloatingAssistant";
import Index from "./pages/Index";
import Renovation from "./pages/Renovation";
import Booking from "./pages/Booking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Lazy load pages that may not exist yet
const AirconServices = lazy(() => import("./pages/AirconServices"));
const Portfolio = lazy(() => import("./pages/Portfolio"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const PortfolioManagement = lazy(() => import("./pages/admin/PortfolioManagement"));
const SubmissionsManagement = lazy(() => import("./pages/admin/SubmissionsManagement"));
const AnalyticsDashboard = lazy(() => import("./pages/admin/AnalyticsDashboard"));
const PricingManagement = lazy(() => import("./pages/admin/PricingManagement"));
const CertificatesManagement = lazy(() => import("./pages/admin/CertificatesManagement"));
const BrandsManagement = lazy(() => import("./pages/admin/BrandsManagement"));
const CompanyInfoManagement = lazy(() => import("./pages/admin/CompanyInfoManagement"));
const AboutUsManagement = lazy(() => import("./pages/admin/AboutUsManagement"));
const ContactUsManagement = lazy(() => import("./pages/admin/ContactUsManagement"));
const SEOManagement = lazy(() => import("./pages/admin/SEOManagement"));
const BCARegistrationsManagement = lazy(() => import("./pages/admin/BCARegistrationsManagement"));
const CROSettingsManagement = lazy(() => import("./pages/admin/CROSettingsManagement"));

const queryClient = new QueryClient();

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const App = () => (
  <HelmetProvider>
    <ThemeProvider defaultTheme="light" storageKey="promach-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/aircon-services" element={<AirconServices />} />
                <Route path="/renovation" element={<Renovation />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/portfolio" element={<PortfolioManagement />} />
                <Route path="/admin/submissions" element={<SubmissionsManagement />} />
                <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
                <Route path="/admin/pricing" element={<PricingManagement />} />
                <Route path="/admin/certificates" element={<CertificatesManagement />} />
                <Route path="/admin/bca-registrations" element={<BCARegistrationsManagement />} />
                <Route path="/admin/brands" element={<BrandsManagement />} />
                <Route path="/admin/company-info" element={<CompanyInfoManagement />} />
                <Route path="/admin/about-us" element={<AboutUsManagement />} />
                <Route path="/admin/contact-us" element={<ContactUsManagement />} />
                <Route path="/admin/seo" element={<SEOManagement />} />
                <Route path="/admin/cro-settings" element={<CROSettingsManagement />} />

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <FloatingAssistant />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
