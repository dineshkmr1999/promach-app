import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Shield,
  Award,
  Users,
  Building,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Target,
  Eye,
  Heart,
  Zap,
  Globe,
  Wrench,
  ShieldCheck,
  Star,
  Building2,
  Thermometer,
  PaintBucket,
  Hammer,
  Cable,
  Wind,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import iso9001 from "@/assets/ISO9001.png";
import iso14001 from "@/assets/ISO14001.png";
import iso45001 from "@/assets/ISO45001.png";
import iso37001 from "@/assets/ISO37001.png";
import sccIso from "@/assets/scc-iso.png";
import uafIso from "@/assets/UAF-ISO.png";
import dunsNumber from "@/assets/duns-number.png";
import logo from "@/assets/LOGO.png";
import { CERTIFICATES, openCertificate, PAGE_SEO, COMPANY_INFO } from "@/constants";
import { useInView } from "@/hooks/useInView";

/* ── Timeline milestones ── */
const milestones = [
  { year: "2011", title: "Company Founded", desc: "Promach Pte Ltd established to serve Singapore's ACMV industry." },
  { year: "2015", title: "BCA Registration", desc: "Registered with the Building and Construction Authority as a licensed contractor." },
  { year: "2018", title: "ISO Certification", desc: "Achieved ISO 9001, 14001, and 45001 certifications for quality, environment, and safety." },
  { year: "2020", title: "Renovation Division", desc: "Expanded into commercial and residential interior design & renovation services." },
  { year: "2023", title: "ISO 37001 & BizSafe Star", desc: "Awarded Anti-Bribery certification and BizSafe Star for workplace safety excellence." },
  { year: "2025", title: "500+ Projects", desc: "Crossed 500 successful projects — homes, offices, clinics, and industrial facilities island-wide." },
];

/* ── Core values ── */
const coreValues = [
  {
    icon: Shield,
    title: "Quality Assurance",
    desc: "ISO-certified processes that guarantee consistent, high-standard delivery on every project.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Award,
    title: "Certified Excellence",
    desc: "Highly trained and accredited technicians with extensive experience across diverse industries.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Heart,
    title: "Customer First",
    desc: "Transparent communication, responsive service, and client satisfaction at every step of the journey.",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Globe,
    title: "Island-Wide Coverage",
    desc: "Comprehensive service reach across all of Singapore — residential, commercial, and industrial.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Ethics",
    desc: "BizSafe Star and ISO 37001 certified. We prioritize safety and maintain the highest ethical standards.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Zap,
    title: "Fast Response",
    desc: "Rapid deployment and same-day service availability for urgent ACMV breakdowns and maintenance needs.",
    gradient: "from-sky-500 to-indigo-500",
  },
];

/* ── Sectors served ── */
const sectors = [
  { icon: Building2, label: "Shopping Malls" },
  { icon: Building, label: "Office Buildings" },
  { icon: Thermometer, label: "Data Centres" },
  { icon: Heart, label: "Hospitals & Clinics" },
  { icon: Wind, label: "Industrial Plants" },
  { icon: Users, label: "Clubs & Hospitality" },
  { icon: PaintBucket, label: "Laboratories" },
  { icon: Cable, label: "Commercial Spaces" },
];

/* ── ISO certifications data ── */
const isoCerts = [
  { img: iso9001, alt: "ISO 9001", label: "ISO 9001", desc: "Quality Management", certIdx: 0 },
  { img: iso14001, alt: "ISO 14001", label: "ISO 14001", desc: "Environmental Management", certIdx: 1 },
  { img: iso45001, alt: "ISO 45001", label: "ISO 45001", desc: "Occupational Health & Safety", certIdx: 2 },
  { img: iso37001, alt: "ISO 37001", label: "ISO 37001", desc: "Anti-Bribery Management", certIdx: 3 },
];

const additionalBadges = [
  { img: sccIso, alt: "SCC Accredited CB-MS" },
  { img: uafIso, alt: "United Accreditation Foundation" },
  { img: dunsNumber, alt: "Dun & Bradstreet DUNS Number" },
];

/* ── Stats ── */
const stats = [
  { value: "15+", label: "Years of Experience", icon: CalendarDays },
  { value: "500+", label: "Projects Delivered", icon: CheckCircle2 },
  { value: "4", label: "ISO Certifications", icon: Award },
  { value: "24/7", label: "Support Available", icon: Clock },
];

const About = () => {
  const heroRef = useInView();
  const storyRef = useInView();
  const valuesRef = useInView();
  const sectorsRef = useInView();
  const timelineRef = useInView();
  const certsRef = useInView();
  const statsRef = useInView();
  const contactRef = useInView();
  const ctaRef = useInView();

  return (
    <Layout
      seo={{
        title: PAGE_SEO.about.title,
        description: PAGE_SEO.about.description,
        keywords: PAGE_SEO.about.keywords,
        canonical: "/about",
        breadcrumbs: [
          { name: "Home", url: "/" },
          { name: "About Us", url: "/about" },
        ],
      }}
    >
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative bg-gradient-to-br from-[hsl(203,41%,15%)] via-primary to-[hsl(203,35%,28%)] text-white py-24 md:py-32 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-white/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        {/* Texture pattern */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

        <div
          ref={heroRef.ref}
          className={`container mx-auto px-4 relative z-10 transition-all duration-1000 ${heroRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-8">
              <img src={logo} alt="Promach" className="h-14 w-auto" />
              <div className="text-left">
                <span className="text-2xl font-bold tracking-wide">PROMACH</span>
                <p className="text-xs text-white/60 tracking-widest uppercase">Pte Ltd</p>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Building Trust Through
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">
                Quality & Integrity
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Singapore&apos;s ISO-certified ACMV and renovation specialist — serving homes, offices, clinics, and industrial facilities since 2011.
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="relative -mt-10 z-20">
        <div
          ref={statsRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${statsRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="text-center transition-all duration-500"
                    style={{ transitionDelay: `${idx * 0.1}s` }}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon size={22} className="text-primary" />
                    </div>
                    <p className="text-3xl md:text-4xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ OUR STORY ════════════════ */}
      <section className="py-16 md:py-24 bg-card">
        <div
          ref={storyRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${storyRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Story text */}
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Who We Are
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-slate-800">Promach Pte Ltd</strong> is a leading provider of air-conditioning &amp; mechanical ventilation (ACMV) services and comprehensive renovation solutions in Singapore. Since our founding in 2011, we have grown from a small team of dedicated technicians to a full-service ACMV and renovation company trusted by some of Singapore&apos;s most demanding facilities.
                </p>
                <p>
                  We maintain <strong className="text-slate-800">Shopping Malls, Clubs, Data Centres, Hospitals, Clinics, Laboratories &amp; Industrial Plants</strong> island-wide. Our certified technicians and responsive management team ensure that every project — from a routine aircon service to a multi-storey commercial fit-out — is completed to the highest standards.
                </p>
                <p>
                  With <strong className="text-slate-800">4 ISO certifications</strong>, BizSafe Star status, and BCA registration, Promach represents the gold standard of reliability, safety, and quality in Singapore&apos;s ACMV and renovation industry.
                </p>
              </div>
            </div>

            {/* Right — Mission & Vision cards */}
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Target size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  To deliver reliable, high-quality ACMV services and renovation solutions that exceed client expectations — with integrity, safety, and environmental responsibility at our core.
                </p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Eye size={20} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  To be Singapore&apos;s most trusted one-stop ACMV and renovation partner — recognized for technical excellence, innovation, and unwavering commitment to quality.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Star size={20} className="text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">UEN: 202008249W</h3>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Registered with ACRA as Promach Pte Ltd. A Singapore-incorporated company committed to transparency and regulatory compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CORE VALUES ════════════════ */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div
          ref={valuesRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${valuesRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">What Defines Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The principles that guide every project, every interaction, and every decision we make.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((value, idx) => {
              const Icon = value.icon;
              return (
                <Card
                  key={value.title}
                  className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  style={{ transitionDelay: `${idx * 0.08}s` }}
                >
                  <CardContent className="p-0">
                    <div className={`h-1.5 bg-gradient-to-r ${value.gradient}`} />
                    <div className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-white" size={26} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{value.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{value.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ SECTORS WE SERVE ════════════════ */}
      <section className="py-16 md:py-20 bg-card">
        <div
          ref={sectorsRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${sectorsRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Reach</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Sectors We Serve</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From high-rise commercial complexes to sensitive healthcare environments, our team has the expertise for every sector.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {sectors.map((sector, idx) => {
              const Icon = sector.icon;
              return (
                <div
                  key={sector.label}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all duration-300 cursor-default"
                  style={{ transitionDelay: `${idx * 0.05}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <Icon size={22} className="text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-white transition-colors duration-300 text-center leading-tight">
                    {sector.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ OUR JOURNEY TIMELINE ════════════════ */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div
          ref={timelineRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${timelineRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Journey</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Key Milestones</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From a small ACMV start-up to a multi-certified, island-wide service provider.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:-translate-x-px" />

              <div className="space-y-8">
                {milestones.map((m, idx) => (
                  <div
                    key={m.year}
                    className={`relative flex items-start gap-6 md:gap-0 transition-all duration-700 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                    style={{ transitionDelay: `${idx * 0.12}s` }}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${idx % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <div className={`bg-white rounded-2xl shadow-md border border-slate-100 p-5 hover:shadow-lg transition-shadow duration-300 ${idx % 2 === 0 ? "md:ml-auto" : ""} max-w-md`}>
                        <span className="text-xs font-bold text-primary tracking-wider uppercase">{m.year}</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1 mb-1">{m.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">{m.desc}</p>
                      </div>
                    </div>

                    {/* Dot on timeline */}
                    <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary border-4 border-white shadow-md -translate-x-1/2 mt-6 z-10" />

                    {/* Spacer for opposite side (desktop) */}
                    <div className="hidden md:block flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CERTIFICATIONS ════════════════ */}
      <section className="py-16 md:py-24 bg-card">
        <div
          ref={certsRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${certsRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Trust & Compliance</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Certifications &amp; Accreditations</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Internationally recognized certifications that validate our commitment to quality, safety, and ethical business practices.
            </p>
          </div>

          {/* ISO Certificates — clickable cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {isoCerts.map((cert, idx) => (
              <button
                key={cert.label}
                onClick={() => openCertificate(CERTIFICATES[cert.certIdx].file)}
                className="group bg-white rounded-2xl border border-slate-200 p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <img
                  src={cert.img}
                  alt={cert.alt}
                  className="h-20 w-auto mx-auto mb-4 grayscale group-hover:grayscale-0 transition-all duration-500"
                />
                <h3 className="font-bold text-slate-900 mb-1">{cert.label}</h3>
                <p className="text-xs text-slate-500">{cert.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs text-primary mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ExternalLink size={12} />
                  View Certificate
                </span>
              </button>
            ))}
          </div>

          {/* Additional accreditation badges */}
          <div className="bg-slate-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-center font-semibold text-slate-900 mb-6">Additional Accreditations</h3>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {additionalBadges.map((badge) => (
                <img
                  key={badge.alt}
                  src={badge.img}
                  alt={badge.alt}
                  className="h-16 md:h-20 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-500"
                />
              ))}
            </div>
            <p className="text-center text-xs text-slate-400 mt-6">
              BizSafe Star &bull; SCC Accredited CB-MS &bull; United Accreditation Foundation &bull; Dun &amp; Bradstreet DUNS Number 659837257
            </p>
          </div>
        </div>
      </section>

      {/* ════════════════ COMPANY INFORMATION ════════════════ */}
      <section className="py-16 md:py-20 bg-muted/50">
        <div
          ref={contactRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${contactRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Get In Touch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Company Information</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Company</h3>
              <p className="text-sm text-slate-500">{COMPANY_INFO.name}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Office Address</h3>
              <p className="text-sm text-slate-500">{COMPANY_INFO.address.full}</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <Phone size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Telephone</h3>
              <a href={COMPANY_INFO.phoneHref} className="text-sm text-primary hover:underline font-medium">
                {COMPANY_INFO.phoneDisplay}
              </a>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-slate-900 mb-1">Email</h3>
              <a href={COMPANY_INFO.emailHref} className="text-sm text-primary hover:underline font-medium">
                {COMPANY_INFO.email}
              </a>
            </div>
          </div>

          {/* Business hours */}
          <div className="max-w-sm mx-auto mt-8 bg-white rounded-2xl border border-slate-100 p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock size={18} className="text-primary" />
              <h3 className="font-bold text-slate-900">Business Hours</h3>
            </div>
            <div className="space-y-1 text-sm text-slate-500">
              <p>{COMPANY_INFO.businessHours.weekdays}</p>
              <p>{COMPANY_INFO.businessHours.saturday}</p>
              <p>{COMPANY_INFO.businessHours.sunday}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CTA ════════════════ */}
      <section className="py-16 md:py-24 bg-card">
        <div
          ref={ctaRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${ctaRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary to-slate-800 p-10 md:p-16 text-center">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Let&apos;s Work Together
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Whether you need ACMV services, a full renovation, or routine maintenance — our team is ready to deliver results you can trust.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking">
                  <Button size="lg" className="rounded-full text-base px-8 gap-2 bg-white text-slate-900 hover:bg-slate-100">
                    Book a Service
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="rounded-full text-base px-8 border-white/30 text-white hover:bg-white/10">
                    Contact Us
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

export default About;
