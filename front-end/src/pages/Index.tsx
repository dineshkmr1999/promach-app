import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ServiceCard from "@/components/ServiceCard";
import FeatureIcon from "@/components/FeatureIcon";
import BCARegistrationsSection from "@/components/BCARegistrationsSection";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { TrustBadges } from "@/components/TrustBadges";
import { Wind, Home, Wrench, Clock, Shield, DollarSign, Award, ExternalLink, MapPin } from "lucide-react";
import { useCMS } from '@/hooks/useCMS';
import { useInView } from '@/hooks/useInView';
import heroAircon from "@/assets/hero-aircon.jpg";
import heroRenovation from "@/assets/hero-renovation.jpg";
import iso9001 from "@/assets/ISO9001.png";
import iso14001 from "@/assets/ISO14001.png";
import iso45001 from "@/assets/ISO45001.png";
import iso37001 from "@/assets/ISO37001.png";
import sccIso from "@/assets/scc-iso.png";
import uafIso from "@/assets/UAF-ISO.png";
import dunsNumber from "@/assets/duns-number.png";
import { CERTIFICATES, openCertificate, PAGE_SEO } from "@/constants";

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || '';

// Animated counter component
function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, isInView } = useInView({ threshold: 0.3 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const Index = () => {
  const { data: cmsData } = useCMS();
  const [brandsWithLogos, setBrandsWithLogos] = useState<Array<{ name: string; logo?: string }>>([]);
  const [textBrands, setTextBrands] = useState<string[]>([]);
  const [cmsCertificates, setCmsCertificates] = useState<Array<{ _id: string; name: string; icon?: string; file: string }>>([]);
  const [bcaRegistrations, setBcaRegistrations] = useState<any>(null);

  // Scroll-triggered animation refs
  const whyChooseUs = useInView();
  const servicesSection = useInView();
  const certificatesSection = useInView();
  const statsSection = useInView();
  const testimonialsSection = useInView();
  const ctaSection = useInView();

  useEffect(() => {
    if (cmsData) {
      const brands = (cmsData.brandsWithLogos || []).filter((b: any) => b.isActive);
      setBrandsWithLogos(brands);
      setTextBrands(cmsData.brands || []);
      setCmsCertificates(cmsData.certificates || []);
      setBcaRegistrations(cmsData.bcaRegistrations || null);
    }
  }, [cmsData]);

  return (
    <Layout
      seo={{
        title: PAGE_SEO.home.title,
        description: PAGE_SEO.home.description,
        keywords: PAGE_SEO.home.keywords,
        canonical: "/",
      }}
      className=""
    >
      {/* Hero Section - Split Layout with Premium Overlay */}
      <section className="relative min-h-[500px] sm:min-h-[600px] md:h-[calc(100vh-5rem)] flex flex-col md:flex-row overflow-hidden animate-fade-in">
        {/* Aircon Side */}
        <div className="relative flex-1 group overflow-hidden border-b md:border-b-0 md:border-r border-white/10 min-h-[400px] sm:min-h-[500px]">
          <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors duration-700 z-10" />
          <img
            src={heroAircon}
            alt="ACMV Systems and Air Conditioning Services"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 bg-gradient-to-t from-black/80 via-black/20 to-transparent py-12 sm:py-16">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 animate-fade-in-up">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg shadow-primary/20">
                <Wind size={32} className="text-white sm:w-10 sm:h-10" />
              </div>
              <h1 className="text-white mb-6 leading-tight">
                ACMV Systems <br />&amp; Services
              </h1>
              <p className="text-xl text-slate-200 mb-8 max-w-md mx-auto font-light leading-relaxed px-4">
                Expert installation, servicing, and maintenance for commercial and industrial cooling systems.
              </p>
              <Link to="/portfolio?category=aircon">
                <Button size="xl" variant="default" className="shadow-xl hover:shadow-2xl hover-lift border-white/20 bg-white text-primary hover:bg-white/90">
                  View Our Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Renovation Side */}
        <div className="relative flex-1 group overflow-hidden min-h-[400px] sm:min-h-[500px]">
          <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors duration-700 z-10" />
          <img
            src={heroRenovation}
            alt="Builder and Renovation Division"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 bg-gradient-to-t from-black/80 via-black/20 to-transparent py-12 sm:py-16">
            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 sm:mb-6 mx-auto shadow-lg">
                <Home size={32} className="text-slate-900 sm:w-10 sm:h-10" />
              </div>
              <h1 className="text-white mb-6 leading-tight">
                Builder &amp; <br />Renovation
              </h1>
              <p className="text-xl text-slate-200 mb-8 max-w-md mx-auto font-light leading-relaxed px-4">
                Premium interior design and renovation solutions for homes, offices, and commercial spaces.
              </p>
              <Link to="/portfolio?category=renovation">
                <Button size="xl" variant="secondary" className="shadow-xl hover:shadow-2xl hover-lift">
                  Explore Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Singapore Badge - Bottom Center */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 hidden md:flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium shadow-lg">
          <MapPin size={14} className="text-red-400" />
          <span>Proudly Serving Singapore Since 2011</span>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section ref={statsSection.ref} className="py-12 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className={`container mx-auto px-4 transition-all duration-700 ${statsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { value: 13, suffix: "+", label: "Years Experience" },
              { value: 5000, suffix: "+", label: "Happy Customers" },
              { value: 4, suffix: "x", label: "ISO Certified" },
              { value: 100, suffix: "%", label: "Licensed & Insured" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-slate-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Promach - Clean & Professional */}
      <section ref={whyChooseUs.ref} className="py-16 md:py-20 bg-muted relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 max-w-3xl mx-auto transition-all duration-700 ${whyChooseUs.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Why Choose Us</span>
            <h2 className="text-slate-900 mb-6">Excellence in Every Detail</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Promach maintains Shopping Malls, Clubs, Data Centres, Hospitals, Clinics, Laboratories &amp; Industrial Plants island-wide. Our certified technicians deliver premium service with transparent pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Certified Experts", description: "Fully licensed and trained technicians for all systems.", delay: 0.1 },
              { icon: Clock, title: "On-Time Service", description: "Punctual appointments and efficient project completion.", delay: 0.2 },
              { icon: Wrench, title: "Premium Quality", description: "Using only the best materials and equipment for your needs.", delay: 0.3 },
              { icon: DollarSign, title: "Transparent Pricing", description: "No hidden costs. Clear and detailed quotations provided.", delay: 0.4 },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`transition-all duration-700 ${whyChooseUs.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${feature.delay}s` }}
              >
                <FeatureIcon icon={feature.icon} title={feature.title} description={feature.description} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BCA Registrations Section */}
      <BCARegistrationsSection data={bcaRegistrations} />

      {/* Quick Service Tiles - Clean Cards */}
      <section ref={servicesSection.ref} className="py-16 md:py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 ${servicesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Expertise</span>
            <h2 className="text-slate-900 mb-6">What We Do</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Comprehensive solutions for your cooling and construction needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { icon: Wind, title: "Aircon Servicing", description: "Comprehensive maintenance including chemical overhaul and steam cleaning for optimal performance.", buttonText: "Book Service", buttonLink: "/booking" },
              { icon: Wrench, title: "Installation & Repair", description: "Expert installation of Split, VRV, and Chiller systems. Fast and reliable repair services.", buttonText: "Get Quote", buttonLink: "/booking" },
              { icon: Home, title: "Renovation Works", description: "Full-service design and build for residential and commercial properties. From concept to completion.", buttonText: "View Portfolio", buttonLink: "/renovation" },
            ].map((service, idx) => (
              <div
                key={idx}
                className={`transition-all duration-700 ${servicesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${(idx + 1) * 0.15}s` }}
              >
                <ServiceCard
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  buttonText={service.buttonText}
                  buttonLink={service.buttonLink}
                  index={idx}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificates Section - Professional Grid */}
      <section ref={certificatesSection.ref} className="py-16 md:py-20 bg-gradient-to-b from-slate-100 to-card">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 ${certificatesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center justify-center gap-3 mb-4 px-6 py-2 bg-primary/10 rounded-full">
              <Award size={24} className="text-primary" />
              <span className="text-primary font-semibold uppercase tracking-wider text-sm">Certified Excellence</span>
            </div>
            <h2 className="text-slate-900 mb-4">Accreditations &amp; Awards</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We are committed to the highest standards of quality, safety, and environmental management.
            </p>
          </div>

          {/* CMS Certificates + Static Certificates */}
          <div className={`flex flex-wrap justify-center items-center gap-6 md:gap-12 lg:gap-16 max-w-6xl mx-auto transition-all duration-700 delay-200 ${certificatesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* CMS Uploaded Certificates */}
            {cmsCertificates.length > 0 && cmsCertificates.map((cert) => (
              <button
                key={cert._id}
                onClick={() => window.open(`${API_URL}${cert.file}`, '_blank')}
                title={`View ${cert.name}`}
                className="group relative transition-all hover:scale-110 duration-300"
              >
                <div className="absolute -inset-4 bg-card rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl" />
                {cert.icon ? (
                  <img
                    src={`${API_URL}${cert.icon}`}
                    alt={cert.name}
                    className="relative h-16 md:h-24 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="relative h-16 md:h-24 w-16 md:w-24 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Award className="w-8 h-8 md:w-10 md:h-10 text-slate-400 group-hover:text-primary transition-colors" />
                    <span className="absolute -bottom-6 text-xs font-medium text-slate-600 whitespace-nowrap">{cert.name}</span>
                  </div>
                )}
              </button>
            ))}

            {/* Fallback: Static Certificates if no CMS certs */}
            {cmsCertificates.length === 0 && (
              <>
                {CERTIFICATES.slice(0, 4).map((cert, idx) => (
                  <button
                    key={idx}
                    onClick={() => openCertificate(cert.file)}
                    title={`View ${cert.name} Certificate`}
                    className="group relative transition-all hover:scale-110 duration-300"
                  >
                    <div className="absolute -inset-4 bg-card rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl" />
                    <img
                      src={[iso9001, iso14001, iso45001, iso37001][idx]}
                      alt={cert.name}
                      className="relative h-16 md:h-24 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  </button>
                ))}
              </>
            )}

            {/* Separator - Hidden on mobile */}
            <div className="h-16 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent hidden md:block" />

            {/* Static Accreditation Logos */}
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 w-full md:w-auto mt-4 md:mt-0">
              <img src={sccIso} alt="SCC Accredited" className="h-12 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110" />
              <img src={uafIso} alt="UAF Accredited" className="h-12 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110" />
              <img src={dunsNumber} alt="DUNS Registered" className="h-12 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110" />
            </div>
          </div>

          {/* Verify on BCA Website Button */}
          <div className="text-center mt-10">
            <a
              href="https://www1.bca.gov.sg/bca-directory/company/Details/202008249W"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-full px-6 gap-2 hover:bg-primary hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
                Verify Our BCA Registration
              </Button>
            </a>
            <p className="text-xs text-slate-500 mt-2">
              Click to verify our registration on the official BCA Singapore website
            </p>
          </div>
        </div>
      </section>

      {/* Brands We Service - Scrolling Marquee */}
      {brandsWithLogos.length > 0 && (
        <section className="py-16 bg-card border-y border-slate-200 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Brands We Service</h2>
              <p className="text-slate-600">We service and maintain all major aircon brands</p>
            </div>
          </div>

          {/* Scrolling Marquee */}
          <div className="relative">
            {/* Gradient overlays for smooth edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-card to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-card to-transparent z-10" />

            {/* Scrolling container */}
            <div className="flex animate-scroll-left hover:pause-animation">
              {/* Duplicated logos for seamless loop */}
              {[...brandsWithLogos, ...brandsWithLogos].map((brand, index) => (
                <div key={index} className="flex-shrink-0 mx-8 md:mx-12 group">
                  {brand.logo ? (
                    <img
                      src={brand.logo.startsWith('http') ? brand.logo : `${API_URL}${brand.logo}`}
                      alt={brand.name}
                      className="h-12 md:h-16 w-auto object-contain transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xl font-bold text-slate-400 group-hover:text-primary transition-colors whitespace-nowrap">{brand.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section - Social Proof */}
      <section ref={testimonialsSection.ref} className="py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Customer Reviews</span>
            <h2 className="text-slate-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers across Singapore
            </p>
          </div>

          <div className={`max-w-3xl mx-auto mb-12 transition-all duration-700 delay-200 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <TestimonialCarousel />
          </div>

          {/* Trust Badges */}
          <div className={`max-w-4xl mx-auto transition-all duration-700 delay-300 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* Bottom CTA - High Impact Professional */}
      <section ref={ctaSection.ref} className="py-20 md:py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className={`container mx-auto px-4 text-center relative z-10 transition-all duration-700 ${ctaSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 text-white tracking-tight leading-tight">
            {["Ready", "to", "Upgrade", "Your", "Space?"].map((word, index) => (
              <span
                key={index}
                className="inline-block mr-3 md:mr-4"
                style={{
                  animation: 'popIn 3s ease-in-out infinite',
                  animationDelay: `${index * 0.15}s`
                }}
              >
                {word}
              </span>
            ))}
          </h2>
          <p className="text-xl text-slate-200 mb-10 max-w-2xl mx-auto font-light">
            Whether it's a cooling solution or a complete renovation, our team is ready to deliver excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/booking">
              <Button size="xl" variant="secondary" className="shadow-xl hover:shadow-2xl hover-lift">
                Book an Appointment
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="xl" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-primary shadow-xl hover:shadow-2xl hover-lift">
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
