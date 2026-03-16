import { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import BCARegistrationsSection from "@/components/BCARegistrationsSection";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { TrustBadges } from "@/components/TrustBadges";
import {
  Wind, Home, Wrench, Clock, Shield, DollarSign, Award, ExternalLink, MapPin,
  ArrowRight, CheckCircle2, Building2, Thermometer, Stethoscope, PaintBucket,
  Sparkles, Phone, Mail,
} from "lucide-react";
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
import { CERTIFICATES, openCertificate, PAGE_SEO, COMPANY_INFO } from "@/constants";

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

      {/* ════════════════ STATS COUNTER BAR ════════════════ */}
      <section ref={statsSection.ref} className="relative py-14 bg-primary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div className={`container mx-auto px-4 relative z-10 transition-all duration-700 ${statsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 15, suffix: "+", label: "Years Experience" },
              { value: 500, suffix: "+", label: "Projects Delivered" },
              { value: 4, suffix: "x", label: "ISO Certified" },
              { value: 100, suffix: "%", label: "Licensed & Insured" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ WHY CHOOSE PROMACH ════════════════ */}
      <section ref={whyChooseUs.ref} className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 max-w-3xl mx-auto transition-all duration-700 ${whyChooseUs.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Excellence in Every Detail</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Promach maintains Shopping Malls, Clubs, Data Centres, Hospitals, Clinics, Laboratories &amp; Industrial Plants island-wide. Our certified technicians deliver premium service with transparent pricing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Certified Experts", description: "Fully licensed technicians with extensive training on all major ACMV systems.", gradient: "from-blue-500 to-cyan-500" },
              { icon: Clock, title: "On-Time Service", description: "Punctual appointments and efficient project completion — we value your time.", gradient: "from-emerald-500 to-teal-500" },
              { icon: Wrench, title: "Premium Quality", description: "Only the best materials and equipment. Every job backed by our workmanship warranty.", gradient: "from-amber-500 to-orange-500" },
              { icon: DollarSign, title: "Transparent Pricing", description: "No hidden costs. Detailed quotations upfront before any work begins.", gradient: "from-violet-500 to-purple-500" },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={idx}
                  className={`group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${whyChooseUs.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className={`h-1.5 bg-gradient-to-r ${feature.gradient}`} />
                    <div className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-white" size={28} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* BCA Registrations Section */}
      <BCARegistrationsSection data={bcaRegistrations} />

      {/* ════════════════ OUR SERVICES ════════════════ */}
      <section ref={servicesSection.ref} className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-700 ${servicesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Expertise</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What We Do</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Comprehensive ACMV and renovation solutions tailored to Singapore&apos;s climate and building standards.</p>
          </div>

          {/* Service Cards — 3 columns, rich design */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Wind,
                title: "Aircon & ACMV Servicing",
                description: "Complete maintenance, chemical overhaul, steam cleaning, gas top-up, and diagnostics for all residential and commercial systems.",
                features: ["Normal servicing from $43.60", "Chemical wash & steam clean", "Gas top-up & leak detection", "All brands supported"],
                buttonText: "Book Service",
                buttonLink: "/booking",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Wrench,
                title: "Installation & Repair",
                description: "Expert installation of split units, VRV/VRF systems, centralised chillers, and AHUs. Fast, reliable repair services with genuine parts.",
                features: ["Split & multi-split systems", "VRV/VRF systems", "Chiller & AHU installation", "Emergency repair service"],
                buttonText: "Get a Quote",
                buttonLink: "/booking",
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: Home,
                title: "Renovation & Interior Design",
                description: "Full-service design and build for homes, offices, clinics, and commercial spaces. From 3D concept to handover.",
                features: ["HDB, condo & landed", "Office & clinic fit-outs", "3D design & permits", "In-house build team"],
                buttonText: "View Renovation",
                buttonLink: "/renovation",
                gradient: "from-violet-500 to-purple-500",
              },
            ].map((service, idx) => {
              const Icon = service.icon;
              return (
                <div
                  key={idx}
                  className={`group relative bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 ${servicesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${(idx + 1) * 0.15}s` }}
                >
                  {/* Gradient accent */}
                  <div className={`h-1.5 bg-gradient-to-r ${service.gradient}`} />

                  <div className="p-6 md:p-8">
                    {/* Step number */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-white" size={26} />
                      </div>
                      <span className="text-4xl font-black text-slate-100 group-hover:text-primary/10 transition-colors duration-300">{String(idx + 1).padStart(2, '0')}</span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-5">{service.description}</p>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-500">
                          <CheckCircle2 size={14} className="text-primary flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link to={service.buttonLink}>
                      <Button variant="outline" className="rounded-full w-full gap-2 border-primary/20 hover:bg-primary hover:text-white transition-all duration-300 group-hover:border-primary/40">
                        {service.buttonText}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ SECTORS WE SERVE ════════════════ */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Reach</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Industries &amp; Sectors</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">From sensitive healthcare environments to large-scale commercial complexes.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 max-w-5xl mx-auto">
            {[
              { icon: Building2, label: "Malls" },
              { icon: Building2, label: "Offices" },
              { icon: Thermometer, label: "Data Centres" },
              { icon: Stethoscope, label: "Hospitals" },
              { icon: Wind, label: "Industrial" },
              { icon: Home, label: "Residential" },
              { icon: PaintBucket, label: "Laboratories" },
              { icon: Sparkles, label: "Hospitality" },
            ].map((sector, idx) => {
              const Icon = sector.icon;
              return (
                <div
                  key={sector.label}
                  className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:bg-primary hover:border-primary transition-all duration-300 cursor-default shadow-sm hover:shadow-lg"
                  style={{ transitionDelay: `${idx * 0.05}s` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <Icon size={20} className="text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-white transition-colors duration-300 text-center">
                    {sector.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ CERTIFICATIONS ════════════════ */}
      <section ref={certificatesSection.ref} className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-16 transition-all duration-700 ${certificatesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Trust &amp; Compliance</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Accreditations &amp; Awards</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Internationally recognized certifications validating our commitment to quality, safety, and ethics.
            </p>
          </div>

          {/* ISO Certificates — clickable cards */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12 transition-all duration-700 delay-200 ${certificatesSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* CMS Certificates */}
            {cmsCertificates.length > 0 ? cmsCertificates.slice(0, 4).map((cert) => (
              <button
                key={cert._id}
                onClick={() => window.open(`${API_URL}${cert.file}`, '_blank', 'noopener,noreferrer')}
                className="group bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
              >
                {cert.icon ? (
                  <img
                    src={`${API_URL}${cert.icon}`}
                    alt={cert.name}
                    className="h-20 w-auto mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                ) : (
                  <div className="h-20 w-20 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Award className="w-10 h-10 text-primary" />
                  </div>
                )}
                <h3 className="font-bold text-slate-900 text-sm mb-1">{cert.name}</h3>
                <span className="inline-flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ExternalLink size={12} />
                  View
                </span>
              </button>
            )) : (
              /* Fallback: Static certificates */
              [
                { img: iso9001, label: "ISO 9001", desc: "Quality Management", idx: 0 },
                { img: iso14001, label: "ISO 14001", desc: "Environmental", idx: 1 },
                { img: iso45001, label: "ISO 45001", desc: "Health & Safety", idx: 2 },
                { img: iso37001, label: "ISO 37001", desc: "Anti-Bribery", idx: 3 },
              ].map((cert) => (
                <button
                  key={cert.label}
                  onClick={() => openCertificate(CERTIFICATES[cert.idx].file)}
                  className="group bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <img
                    src={cert.img}
                    alt={cert.label}
                    className="h-20 w-auto mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <h3 className="font-bold text-slate-900 text-sm">{cert.label}</h3>
                  <p className="text-xs text-slate-500">{cert.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink size={12} />
                    View Certificate
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Additional badges */}
          <div className="bg-slate-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              <img src={sccIso} alt="SCC Accredited" className="h-14 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110" />
              <img src={uafIso} alt="UAF Accredited" className="h-14 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110" />
              <img src={dunsNumber} alt="DUNS Registered" className="h-14 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500 hover:scale-110" />
            </div>
          </div>

          {/* BCA Verification */}
          <div className="text-center mt-10">
            <a
              href="https://www1.bca.gov.sg/bca-directory/company/Details/202008249W"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="rounded-full px-8 gap-2 hover:bg-primary hover:text-white transition-colors">
                <ExternalLink className="h-4 w-4" />
                Verify Our BCA Registration
              </Button>
            </a>
            <p className="text-xs text-slate-400 mt-2">Click to verify on the official BCA Singapore website</p>
          </div>
        </div>
      </section>

      {/* ════════════════ BRANDS MARQUEE ════════════════ */}
      {brandsWithLogos.length > 0 && (
        <section className="py-14 bg-muted/50 border-y border-slate-200 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Trusted Brands</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Brands We Service</h2>
              <p className="text-slate-600">Authorized servicing for all major aircon manufacturers</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted/80 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted/80 to-transparent z-10" />

            <div className="flex animate-scroll-left hover:pause-animation">
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

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <section ref={testimonialsSection.ref} className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className={`text-center mb-12 transition-all duration-700 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Customer Reviews</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Trusted by hundreds of homeowners and businesses across Singapore.
            </p>
          </div>

          <div className={`max-w-3xl mx-auto mb-12 transition-all duration-700 delay-200 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <TestimonialCarousel />
          </div>

          <div className={`max-w-4xl mx-auto transition-all duration-700 delay-300 ${testimonialsSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <TrustBadges />
          </div>
        </div>
      </section>

      {/* ════════════════ CONTACT STRIP ════════════════ */}
      <section className="py-12 bg-muted/50 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Call Us</p>
                <a href={COMPANY_INFO.phoneHref} className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                  {COMPANY_INFO.phoneDisplay}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Email</p>
                <a href={COMPANY_INFO.emailHref} className="text-sm font-bold text-slate-900 hover:text-primary transition-colors">
                  {COMPANY_INFO.email}
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Office</p>
                <p className="text-sm font-bold text-slate-900">Suntec Tower Three, Singapore</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Hours</p>
                <p className="text-sm font-bold text-slate-900">Mon-Fri 9am-6pm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ BOTTOM CTA ════════════════ */}
      <section ref={ctaSection.ref} className="py-16 md:py-24 bg-card">
        <div className={`container mx-auto px-4 transition-all duration-700 ${ctaSection.isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary to-slate-800 p-10 md:p-16">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Upgrade Your Space?
              </h2>
              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                Whether it&apos;s a cooling solution or a complete renovation, our team is ready to deliver excellence. Get a free consultation today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking">
                  <Button size="lg" className="rounded-full text-base px-8 gap-2 bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                    Book an Appointment
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="rounded-full text-base px-8 border-white/30 text-white hover:bg-white/10">
                    Request a Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
