import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { SEO, SEOProps } from "@/components/SEO";
import { MobileCTABar } from "@/components/MobileCTABar";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";

interface LayoutProps {
  children: ReactNode;
  seo?: SEOProps;
  className?: string;
  hideMobileCTA?: boolean;
}

/**
 * Layout component that wraps all pages with Navigation, Footer, and SEO
 * Ensures consistent structure across all pages
 * Includes CRO elements: MobileCTABar and ExitIntentPopup
 */
const Layout = ({ children, seo, className = "", hideMobileCTA = false }: LayoutProps) => {
  const handleExitIntentSubmit = async (email: string) => {
    try {
      await import("@/services/api").then(({ submissionsAPI }) =>
        submissionsAPI.create({
          email,
          name: "Visitor (Exit Intent)",
          type: "contact",
          source: "Exit Intent Popup",
          message: "User requested discount code via exit intent popup"
        })
      );
    } catch (error) {
      console.error("Failed to submit exit intent email:", error);
      throw error;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-background font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden overflow-y-auto ${className}`}>
      {seo && <SEO {...seo} />}
      <Navigation />
      <main className="flex-1">
        {children}
      </main>
      <Footer />

      {/* CRO Components */}
      {!hideMobileCTA && <MobileCTABar />}
      <ExitIntentPopup onSubmit={handleExitIntentSubmit} />
    </div>
  );
};

export default Layout;
