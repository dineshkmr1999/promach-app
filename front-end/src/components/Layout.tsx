import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO, SEOProps } from "@/components/SEO";

interface LayoutProps {
  children: ReactNode;
  seo?: SEOProps;
  className?: string;
}

/**
 * Layout component that wraps all pages with Navigation, Footer, and SEO
 * Ensures consistent structure across all pages
 */
const Layout = ({ children, seo, className = "" }: LayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden overflow-y-auto ${className}`}>
      {seo && <SEO {...seo} />}
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
