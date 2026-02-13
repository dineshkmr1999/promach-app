import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useCMS } from "@/hooks/useCMS";
import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

interface PricingTableData {
  title: string;
  description: string;
  headers: string[];
  data: Record<string, string>[];  // Array of objects like {units: "1", price: "$43.60"}
  scopeOfJob: string[];
  duration?: string;
  tableId?: string;
}

interface PricingTableProps {
  title: string;
  description: string;
  headers: string[];
  data: Record<string, string>[];  // Array of objects
  scopeOfJob: string[];
  duration?: string;
}

const PricingTable = ({ title, description, headers, data, scopeOfJob, duration }: PricingTableProps) => (
  <Card className="mb-8">
    <CardContent className="pt-6">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>

      <div className="overflow-x-auto mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted">
              {headers.map((header, idx) => (
                <th key={idx} className="border border-border p-3 text-left font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(data || []).map((row, idx) => (
              <tr key={idx} className="hover:bg-muted/50">
                {Object.values(row || {}).map((cell, cellIdx) => (
                  <td key={cellIdx} className="border border-border p-3">{cell || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">Scope of Job:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {scopeOfJob.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
        {duration && (
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Duration:</strong> {duration}
          </p>
        )}
      </div>
    </CardContent>
  </Card>
);

const AirconServices = () => {
  const { data: cmsData, isLoading } = useCMS();
  const [brands, setBrands] = useState<Array<{ name: string; logo?: string | null }>>([]);
  const [pricingTables, setPricingTables] = useState<PricingTableData[]>([]);
  const [additionalServices, setAdditionalServices] = useState<any>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Check for hash in URL to expand specific service
  const location = useLocation();

  useEffect(() => {
    // Only proceed if we have a hash
    if (!location.hash) return;

    const hash = location.hash.replace('#', '').toLowerCase();
    let targetId: string | null = null;
    let shouldExpand = false;

    // 1. Check Pricing Tables (Accordion)
    if (pricingTables.length > 0) {
      const match = pricingTables.find((table, idx) => {
        const id = table.tableId?.toLowerCase() || `table-${idx}`;
        const title = table.title.toLowerCase();

        // Exact ID match or Keyword match
        if (id === hash) return true;
        if (hash === 'chemical' && title.includes('chemical') && !title.includes('overhaul')) return true;
        if (hash === 'overhaul' && title.includes('overhaul')) return true;
        if (hash === 'steam' && title.includes('steam')) return true;
        if (hash === 'normal' && (title.includes('normal') || title.includes('general'))) return true;
        if (hash === 'installation' && title.includes('installation')) return true;

        return false;
      });

      if (match) {
        targetId = match.tableId || `table-${pricingTables.indexOf(match)}`;
        shouldExpand = true;
      }
    }

    // 2. Check Static Cards (if not found in pricing tables)
    if (!targetId) {
      if (['condenser', 'gas', 'repair'].includes(hash)) {
        targetId = hash;
      }
    }

    // Execute Scroll & Highlight
    if (targetId) {
      if (shouldExpand) {
        setExpandedService(targetId);
      }
      setHighlightedId(targetId);

      // Scroll after delay
      setTimeout(() => {
        const element = document.getElementById(targetId!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [pricingTables, location.hash]);

  useEffect(() => {
    if (cmsData) {
      if (cmsData.brandsWithLogos) {
        const activeBrands = cmsData.brandsWithLogos.filter((b: any) => b.isActive);
        setBrands(activeBrands);
      }
      if (cmsData.pricingTables) {
        setPricingTables(cmsData.pricingTables);
      }
      if (cmsData.additionalServices) {
        setAdditionalServices(cmsData.additionalServices);
      }
    }
  }, [cmsData]);

  return (
    <Layout
      seo={{
        title: "Aircon & ACMV Services | Promach Singapore",
        description: "Professional aircon servicing, chemical wash, steam wash, and maintenance services in Singapore. Competitive pricing for residential and commercial properties.",
        keywords: ["aircon servicing", "chemical wash", "steam wash", "ACMV maintenance", "Singapore"],
        canonical: "/aircon-services",
      }}
    >
      {/* Header */}
      <section className="relative bg-gradient-to-br from-[hsl(203,41%,15%)] via-primary to-[hsl(203,35%,28%)] text-white py-20 md:py-24 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Aircon & ACMV Services</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Professional air-conditioning servicing for residential, commercial, and industrial properties
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading pricing...</p>
          </div>
        ) : (
          <>
            {/* CMS Pricing Tables - Accordion Style */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-4">Our Services & Pricing</h2>
              {pricingTables.map((table, idx) => {
                const tableKey = table.tableId || `table-${idx}`;
                const isExpanded = expandedService === tableKey;

                return (
                  <Card
                    key={tableKey}
                    id={tableKey}
                    className={cn(
                      "overflow-hidden transition-all duration-500",
                      (isExpanded || highlightedId === tableKey) ? "ring-2 ring-primary shadow-lg scale-[1.01]" : ""
                    )}
                  >
                    {/* Accordion Header - Click to expand */}
                    <button
                      onClick={() => setExpandedService(isExpanded ? null : tableKey)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                    >
                      <div>
                        <h3 className="text-xl font-bold">{table.title}</h3>
                        <p className="text-sm text-muted-foreground">{table.description}</p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-6 h-6 text-primary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>

                    {/* Accordion Content - Pricing Table */}
                    <div className={cn(
                      "transition-all duration-300 ease-in-out overflow-hidden",
                      isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <CardContent className="pt-0 pb-6 border-t">
                        {/* Pricing Table */}
                        <div className="overflow-x-auto my-4">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted">
                                {table.headers.map((header, hIdx) => (
                                  <th key={hIdx} className="border border-border p-3 text-left font-semibold">{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {(table.data || []).map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-muted/50">
                                  {Object.values(row || {}).map((cell, cIdx) => (
                                    <td key={cIdx} className="border border-border p-3">{cell || '-'}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Scope of Job */}
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Scope of Job:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {table.scopeOfJob.map((item, sIdx) => (
                              <li key={sIdx}>{item}</li>
                            ))}
                          </ul>
                          {table.duration && (
                            <p className="mt-3 text-sm text-muted-foreground">
                              <strong>Duration:</strong> {table.duration}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Additional Services */}
            {additionalServices && (
              <div className="grid md:grid-cols-3 gap-6 my-8">
                <Card
                  id="condenser"
                  className={highlightedId === 'condenser' ? "ring-2 ring-primary shadow-lg scale-[1.01] transition-all duration-500" : "transition-all duration-500"}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Condenser Cleaning</h3>
                    <ul className="space-y-2 text-sm">
                      <li>Normal Chemical: <span className="font-semibold">{additionalServices.condenserCleaning?.normal || '$54.50'}</span></li>
                      <li>Dry: <span className="font-semibold">{additionalServices.condenserCleaning?.dry || '$87.20–$130.80'}</span></li>
                      <li>Steam: <span className="font-semibold">{additionalServices.condenserCleaning?.steam || '$87.20'}</span></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card
                  id="gas"
                  className={highlightedId === 'gas' ? "ring-2 ring-primary shadow-lg scale-[1.01] transition-all duration-500" : "transition-all duration-500"}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Gas Top-Up</h3>
                    <p className="text-xs text-muted-foreground mb-2">(Inclusive of GST & Transport)</p>
                    <ul className="space-y-2 text-sm">
                      <li>R22: <span className="font-semibold">{additionalServices.gasTopUp?.r22 || '$43.60–$130.80'}</span></li>
                      <li>R410A: <span className="font-semibold">{additionalServices.gasTopUp?.r410a || '$65.40–$163.50'}</span></li>
                      <li>R32: <span className="font-semibold">{additionalServices.gasTopUp?.r32 || '$87.20–$218.00'}</span></li>
                    </ul>
                  </CardContent>
                </Card>

                <Card
                  id="repair"
                  className={highlightedId === 'repair' ? "ring-2 ring-primary shadow-lg scale-[1.01] transition-all duration-500" : "transition-all duration-500"}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg mb-3">Repair / Troubleshooting</h3>
                    <p className="text-sm mb-2">
                      Troubleshooting charge: <span className="font-semibold">{additionalServices.troubleshooting || '$54.50'}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (Waived if you proceed with repair by Promach technicians)
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Brands */}
            {brands.length > 0 && (
              <div className="my-12 py-12 border-y border-slate-100">
                <h3 className="text-2xl md:text-3xl font-bold mb-2 text-center">Brands We Service</h3>
                <p className="text-muted-foreground text-center mb-8">We service and maintain all major aircon brands</p>
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-8 md:gap-10 max-w-5xl mx-auto">
                  {brands.map((brand, idx) => (
                    <div key={idx} className="flex items-center justify-center p-4 hover:scale-105 transition-transform">
                      {brand.logo ? (
                        <img
                          src={brand.logo.startsWith('http') ? brand.logo : `${API_URL}${brand.logo}`}
                          alt={brand.name}
                          className="h-10 md:h-12 w-auto object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <span className={`text-sm font-semibold text-slate-600 text-center ${brand.logo ? 'hidden' : ''}`}>
                        {brand.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="text-center my-12">
              <h3 className="text-2xl font-bold mb-4">Ready to Book Your Service?</h3>
              <Link to="/booking">
                <Button size="lg" className="rounded-full">Book Appointment Now</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AirconServices;
