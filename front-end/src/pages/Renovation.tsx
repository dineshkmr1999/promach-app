import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Home, Building2, Stethoscope, Palette, Ruler, Wrench } from "lucide-react";
import { PAGE_SEO } from "@/constants";

const Renovation = () => {
  return (
    <Layout
      seo={{
        title: PAGE_SEO.renovation.title,
        description: PAGE_SEO.renovation.description,
        keywords: PAGE_SEO.renovation.keywords,
        canonical: "/renovation",
        breadcrumbs: [
          { name: "Home", url: "/" },
          { name: "Renovation", url: "/renovation" },
        ],
      }}
    >
      {/* Header */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Design, Build & Maintain Under One Roof</h1>
          <p className="text-xl max-w-3xl mx-auto mb-6">
            Complete renovation solutions for residential, commercial, and clinic spaces
          </p>
          <Link to="/booking?service=renovation">
            <Button size="lg" variant="secondary" className="rounded-full">Get Free Quote</Button>
          </Link>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Main Services */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Palette className="text-primary" size={40} />
              </div>
              <CardTitle className="text-2xl">Design & Rendering</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Professional 3D design and rendering services to visualize your space before construction begins. Our experienced designers work closely with you to create the perfect layout.
              </CardDescription>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>3D Visualization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Space Planning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Material Selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Color Consultation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Home className="text-primary" size={40} />
              </div>
              <CardTitle className="text-2xl">Residential Renovation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Transform your home with our comprehensive residential renovation services. From HDB flats to condominiums, we handle everything from flooring to custom carpentry.
              </CardDescription>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>HDB & Condo Renovations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Kitchen & Bathroom Upgrades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Flooring & Carpentry</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Built-in Wardrobes</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="text-primary" size={40} />
              </div>
              <CardTitle className="text-2xl">Commercial & Clinic Fit-Outs</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Specialized in office and clinic renovations that meet industry standards and regulations. We create functional, professional spaces tailored to your business needs.
              </CardDescription>
              <ul className="mt-4 space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Office Renovations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Medical Clinic Fit-Outs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Retail Space Design</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Compliance & Permits</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <section className="bg-secondary rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Why Choose Promach for Your Renovation</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Ruler className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Comprehensive Design</h3>
              <p className="text-sm text-muted-foreground">
                From concept to completion, our team handles every detail of your renovation project with precision and care.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Wrench className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Quality Workmanship</h3>
              <p className="text-sm text-muted-foreground">
                Our skilled craftsmen ensure the highest quality standards in every aspect of construction and finishing.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Stethoscope className="text-primary" size={32} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Specialized Expertise</h3>
              <p className="text-sm text-muted-foreground">
                Extensive experience in clinic and commercial fit-outs, ensuring compliance with all relevant regulations.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Space?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Contact us today for a free consultation and quote. Our team is ready to bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking?service=renovation">
              <Button size="lg" className="rounded-full">Request Free Quote</Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="rounded-full">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Renovation;
