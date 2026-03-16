import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  Home,
  Building2,
  Stethoscope,
  Palette,
  Ruler,
  Wrench,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  PenTool,
  HardHat,
  Sparkles,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  Users,
  Star,
  Sofa,
  PaintBucket,
  Layers,
  DoorOpen,
  Bath,
  ChefHat,
  Lamp,
  MonitorSmartphone,
} from "lucide-react";
import { PAGE_SEO } from "@/constants";
import { useInView } from "@/hooks/useInView";
import heroRenovation from "@/assets/hero-renovation.jpg";

/* ── Design Process Steps ── */
const designProcess = [
  {
    step: "01",
    icon: Lightbulb,
    title: "Consultation & Briefing",
    description:
      "We begin with an in-depth consultation to understand your vision, lifestyle needs, budget, and timeline. Our designers visit your space to assess possibilities.",
    details: ["Site survey & measurement", "Lifestyle & preference analysis", "Budget planning", "Timeline discussion"],
  },
  {
    step: "02",
    icon: PenTool,
    title: "Concept & 3D Design",
    description:
      "Our interior designers create detailed 3D renderings and mood boards so you can visualize every element — from layout to lighting — before any work begins.",
    details: ["3D rendering & walkthroughs", "Floor plan & space planning", "Material & colour palettes", "Lighting design scheme"],
  },
  {
    step: "03",
    icon: ClipboardCheck,
    title: "Detailed Quotation & Permits",
    description:
      "We prepare a transparent, itemized quotation with no hidden costs. For HDB flats, we handle all HDB renovation permits and BCA approvals on your behalf.",
    details: ["Itemized cost breakdown", "HDB/BCA permit handling", "Material specifications", "Revision & approval"],
  },
  {
    step: "04",
    icon: HardHat,
    title: "Construction & Build",
    description:
      "Our skilled craftsmen execute the renovation with meticulous attention to detail. A dedicated project manager ensures quality at every stage.",
    details: ["Hacking & demolition", "Electrical & plumbing rough-in", "Carpentry & built-ins", "Tiling, painting & finishing"],
  },
  {
    step: "05",
    icon: Sparkles,
    title: "Final Styling & Handover",
    description:
      "We complete final touch-ups, deep-clean the space, and walk through every detail with you. Your dream space is ready to move in.",
    details: ["Quality inspection", "Deep cleaning", "Client walkthrough", "Defect-free handover & warranty"],
  },
];

/* ── Service Categories ── */
const serviceCategories = [
  {
    icon: Home,
    title: "HDB Renovation",
    description: "Complete BTO, resale & executive flat renovations with HDB-approved contractors. We handle permits and ensure full compliance.",
    features: ["BTO & Resale", "Kitchen & bathroom overhaul", "Custom carpentry", "Flooring & painting"],
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Building2,
    title: "Condo & Landed",
    description: "Luxury interior design for condominiums and landed properties. Bespoke solutions that reflect your personal style and elevate your living experience.",
    features: ["Wet & dry kitchen design", "Master suite design", "Balcony & patio", "Smart home integration"],
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: MonitorSmartphone,
    title: "Office & Commercial",
    description: "Create productive, inspiring workspaces. From open-plan offices to reception areas, we design environments that boost morale and impress clients.",
    features: ["Office space planning", "Reception & meeting rooms", "IT infrastructure", "Ergonomic design"],
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Stethoscope,
    title: "Medical & Clinic Fit-Outs",
    description: "Specialized clinic renovations meeting MOH and NEA standards. Functional layouts that optimize patient flow and comply with all regulations.",
    features: ["MOH-compliant layout", "Waiting & treatment rooms", "Sterilization areas", "Infection control design"],
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: ChefHat,
    title: "F&B & Retail",
    description: "Eye-catching retail and restaurant interiors designed to drive footfall and deliver memorable customer experiences in Singapore's competitive market.",
    features: ["Shop front design", "Kitchen layout (F&B)", "Display & shelving", "Ambience & branding"],
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Palette,
    title: "Interior Styling",
    description: "Soft furnishing, furniture curation, and styling services. Perfect for those who want a designer touch without a full renovation.",
    features: ["Furniture selection", "Curtains & upholstery", "Art & accessories", "Colour consultation"],
    gradient: "from-sky-500 to-indigo-500",
  },
];

/* ── Design Specialties ── */
const designSpecialties = [
  { icon: Sofa, label: "Living Rooms" },
  { icon: Bath, label: "Bathrooms" },
  { icon: ChefHat, label: "Kitchens" },
  { icon: DoorOpen, label: "Bedrooms" },
  { icon: Lamp, label: "Lighting Design" },
  { icon: PaintBucket, label: "Feature Walls" },
  { icon: Layers, label: "False Ceilings" },
  { icon: Ruler, label: "Built-in Carpentry" },
];

/* ── Why Choose Us Stats ── */
const stats = [
  { value: "500+", label: "Projects Completed" },
  { value: "15+", label: "Years Experience" },
  { value: "100%", label: "Permit Success Rate" },
  { value: "4.9★", label: "Average Rating" },
];

const Renovation = () => {
  const heroRef = useInView();
  const processRef = useInView();
  const servicesRef = useInView();
  const specialtiesRef = useInView();
  const whyUsRef = useInView();
  const statsRef = useInView();
  const ctaRef = useInView();

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
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={heroRenovation}
            alt="Interior design showcase"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-white/10 rounded-full blur-[100px]" />
        </div>

        <div
          ref={heroRef.ref}
          className={`container mx-auto px-4 relative z-10 py-20 transition-all duration-1000 ${heroRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
        >
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/90 text-sm font-medium mb-6">
              <Sparkles size={14} />
              Singapore&apos;s Trusted Interior Design &amp; Renovation Firm
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Transform Your Space
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">
                From Concept to Reality
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl">
              Award-quality interior design for homes, offices, and commercial spaces.
              We manage every detail — from 3D design and permits to build and handover.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/booking?service=renovation">
                <Button size="lg" className="rounded-full text-base px-8 gap-2 bg-white text-slate-900 hover:bg-slate-100">
                  Get Free Consultation
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/portfolio">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 border-white/30 text-white hover:bg-white/10">
                  View Our Projects
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <ShieldCheck size={18} className="text-emerald-400" />
                <span>BCA Registered</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Star size={18} className="text-amber-400" />
                <span>500+ Projects Delivered</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Clock size={18} className="text-sky-400" />
                <span>On-Time Guarantee</span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Users size={18} className="text-violet-400" />
                <span>Dedicated Project Manager</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ DESIGN PROCESS ════════════════ */}
      <section className="py-16 md:py-24 bg-card">
        <div
          ref={processRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${processRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
              Our Process
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              How We Bring Your Vision to Life
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              A proven 5-step interior design and renovation process refined over hundreds of projects across Singapore.
            </p>
          </div>

          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-5 lg:gap-4">
            {designProcess.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative transition-all duration-700"
                  style={{ transitionDelay: `${idx * 0.15}s` }}
                >
                  {/* Connector line (desktop) */}
                  {idx < designProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
                  )}
                  <div className="relative bg-card border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="text-primary" size={22} />
                      </div>
                      <span className="text-3xl font-black text-primary/15">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{step.description}</p>
                    <ul className="space-y-1.5">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2 text-xs text-slate-500">
                          <CheckCircle2 size={13} className="text-primary mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ SERVICES GRID ════════════════ */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div
          ref={servicesRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${servicesRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
              What We Do
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Renovation &amp; Interior Design Services
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              From cosy HDB flats to sprawling commercial spaces, we deliver end-to-end design and build solutions tailored to Singapore&apos;s unique requirements.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceCategories.map((service, idx) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.title}
                  className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                  style={{ transitionDelay: `${idx * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    {/* Gradient top bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${service.gradient}`} />
                    <div className="p-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="text-white" size={26} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed mb-5">{service.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {service.features.map((f) => (
                          <div key={f} className="flex items-center gap-1.5 text-xs text-slate-500">
                            <CheckCircle2 size={12} className="text-primary flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ DESIGN SPECIALTIES ════════════════ */}
      <section className="py-16 md:py-20 bg-card">
        <div
          ref={specialtiesRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${specialtiesRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-center mb-12">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
              Design Expertise
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Every Corner, Expertly Designed
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our interior designers specialize in every area of your space, ensuring a cohesive look and functional layout throughout.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {designSpecialties.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all duration-300 cursor-default"
                  style={{ transitionDelay: `${idx * 0.05}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:bg-white/20 transition-colors duration-300">
                    <Icon size={22} className="text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-white transition-colors duration-300 text-center">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ WHY CHOOSE US ════════════════ */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div
          ref={whyUsRef.ref}
          className={`container mx-auto px-4 transition-all duration-700 ${whyUsRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Content */}
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">
                Why Promach
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Singapore's Trusted Name in Renovation
              </h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                With over 15 years of experience and BCA-registered contractor status, Promach has delivered hundreds of successful renovation projects across Singapore — from 3-room HDB flats to multi-storey commercial fit-outs.
              </p>

              <div className="space-y-5">
                {[
                  {
                    icon: ShieldCheck,
                    title: "BCA Registered & ISO Certified",
                    desc: "Licensed contractor with ISO 9001, 14001, 45001 & 37001 certifications. Your project is in safe, qualified hands.",
                  },
                  {
                    icon: Ruler,
                    title: "In-House Design & Build Team",
                    desc: "No subcontracting headaches. Our full-time designers, carpenters, electricians, and plumbers work under one roof.",
                  },
                  {
                    icon: Clock,
                    title: "Transparent Pricing & Timeline",
                    desc: "Detailed quotation with no hidden costs. We commit to completion dates and provide weekly progress updates.",
                  },
                  {
                    icon: Wrench,
                    title: "Comprehensive Warranty",
                    desc: "All workmanship backed by our defect liability period. We stand behind the quality of every project we deliver.",
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex gap-4 transition-all duration-500"
                      style={{ transitionDelay: `${idx * 0.1}s` }}
                    >
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Image with overlay cards */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={heroRenovation}
                  alt="Promach interior renovation project"
                  className="w-full h-[500px] object-cover"
                />
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-4 md:-left-8 bg-white rounded-2xl shadow-xl p-5 max-w-[240px]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="text-emerald-600" size={20} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">500+</p>
                    <p className="text-xs text-slate-500">Projects Completed</p>
                  </div>
                </div>
              </div>
              {/* Floating rating card */}
              <div className="absolute -top-4 -right-4 md:-right-8 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-500 font-medium">4.9 / 5 Customer Rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS BAR ════════════════ */}
      <section className="relative py-14 bg-primary overflow-hidden">
        {/* Texture overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        </div>
        <div
          ref={statsRef.ref}
          className={`container mx-auto px-4 relative z-10 transition-all duration-700 ${statsRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className="text-center transition-all duration-500"
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <p className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
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
            {/* Decorative orbs */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Space?
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Book a free on-site consultation with our interior designers. We&apos;ll discuss your vision, measure your space, and provide a no-obligation quote — all within 3 working days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booking?service=renovation">
                  <Button size="lg" className="rounded-full text-base px-8 gap-2 bg-white text-slate-900 hover:bg-slate-100">
                    Book Free Consultation
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

export default Renovation;
