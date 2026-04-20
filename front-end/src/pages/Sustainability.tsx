import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Leaf,
    Zap,
    Globe,
    Recycle,
    Package,
    Shield,
    ShieldCheck,
    Monitor,
    Trash2,
    TrendingUp,
    ClipboardList,
    ShoppingCart,
    HardHat,
    CheckCircle,
    Wrench,
    Snowflake,
    Layers,
    Truck,
    Download,
    FileText,
    Award,
    Sparkles,
    ArrowRight,
    AlertCircle,
} from "lucide-react";
import { PAGE_SEO } from "@/constants";
import { useInView } from "@/hooks/useInView";
import { sustainabilityAPI } from "@/services/api";
import PromachLoader from "@/components/PromachLoader";

// Map string identifiers (stored in DB) to Lucide icon components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
    Zap,
    Globe,
    Recycle,
    Package,
    Shield,
    ShieldCheck,
    Monitor,
    Trash2,
    TrendingUp,
    ClipboardList,
    ShoppingCart,
    HardHat,
    CheckCircle,
    Wrench,
    Snowflake,
    Layers,
    Truck,
    Leaf,
    Award,
    FileText,
};

const renderIcon = (name: string | undefined, className = "h-8 w-8") => {
    const Icon = (name && ICON_MAP[name]) || Leaf;
    return <Icon className={className} />;
};

const API_URL = import.meta.env.VITE_API_URL || "/api";

const toAbsoluteFileUrl = (file: string) => {
    if (!file) return "#";
    if (/^https?:\/\//i.test(file)) return file;
    // API_URL is typically "/api" or "http://host/api" — the backend serves
    // /uploads at root, so strip the trailing "/api".
    const base = API_URL.replace(/\/api\/?$/, "");
    return `${base}${file.startsWith("/") ? "" : "/"}${file}`;
};

interface SustainabilityContent {
    hero?: { title?: string; subtitle?: string; badge?: string };
    commitment?: { title?: string; paragraphs?: string[] };
    framework?: {
        title?: string;
        intro?: string;
        outro?: string;
        standards?: Array<{ _id?: string; code?: string; name?: string; description?: string; isActive?: boolean; order?: number }>;
    };
    focusAreas?: {
        title?: string;
        subtitle?: string;
        items?: Array<{ _id?: string; title?: string; description?: string; icon?: string; isActive?: boolean; order?: number }>;
    };
    targets?: {
        title?: string;
        subtitle?: string;
        items?: Array<{ _id?: string; title?: string; description?: string; icon?: string; isActive?: boolean; order?: number }>;
    };
    implementation?: {
        title?: string;
        subtitle?: string;
        steps?: Array<{ _id?: string; title?: string; description?: string; icon?: string; isActive?: boolean; order?: number }>;
    };
    alternatives?: {
        title?: string;
        subtitle?: string;
        items?: Array<{ _id?: string; title?: string; description?: string; icon?: string; isActive?: boolean; order?: number }>;
    };
    continuousImprovement?: { title?: string; paragraphs?: string[] };
    disclaimer?: string;
    documents?: Array<{ _id?: string; name?: string; description?: string; file?: string; isActive?: boolean; order?: number }>;
}

const Sustainability = () => {
    const [content, setContent] = useState<SustainabilityContent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const heroRef = useInView();
    const commitmentRef = useInView();
    const frameworkRef = useInView();
    const focusRef = useInView();
    const targetsRef = useInView();
    const implRef = useInView();
    const altRef = useInView();
    const improvementRef = useInView();
    const docsRef = useInView();
    const ctaRef = useInView();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await sustainabilityAPI.get();
                if (!cancelled) setContent(data || {});
            } catch (err) {
                console.error("Failed to load sustainability content:", err);
                if (!cancelled) setContent({});
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const sortActive = <T extends { isActive?: boolean; order?: number }>(list?: T[]) =>
        (list || [])
            .filter((i) => i.isActive !== false)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const standards = sortActive(content?.framework?.standards);
    const focusItems = sortActive(content?.focusAreas?.items);
    const targetItems = sortActive(content?.targets?.items);
    const steps = sortActive(content?.implementation?.steps);
    const alternatives = sortActive(content?.alternatives?.items);
    const documents = sortActive(content?.documents);

    if (isLoading) {
        return (
            <Layout
                seo={{
                    title: PAGE_SEO.sustainability.title,
                    description: PAGE_SEO.sustainability.description,
                    keywords: [...PAGE_SEO.sustainability.keywords],
                    canonical: "/sustainability",
                }}
            >
                <PromachLoader />
            </Layout>
        );
    }

    return (
        <Layout
            seo={{
                title: PAGE_SEO.sustainability.title,
                description: PAGE_SEO.sustainability.description,
                keywords: [...PAGE_SEO.sustainability.keywords],
                canonical: "/sustainability",
                breadcrumbs: [
                    { name: "Home", url: "/" },
                    { name: "Sustainability", url: "/sustainability" },
                ],
            }}
        >
            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white">
                {/* Decorative blurred orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-0 right-0 w-[32rem] h-[32rem] bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                </div>

                {/* Soft pattern */}
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                        backgroundSize: "32px 32px",
                    }}
                />

                <div
                    ref={heroRef.ref}
                    className={`relative container mx-auto px-4 py-24 md:py-32 text-center transition-all duration-700 ${
                        heroRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-sm font-medium mb-6 backdrop-blur-sm">
                        <Leaf className="h-4 w-4" />
                        {content?.hero?.badge || "ISO 14001 Certified"}
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
                        <span className="bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-300 bg-clip-text text-transparent">
                            {content?.hero?.title || "Sustainability Policy & Commitment"}
                        </span>
                    </h1>
                    <p className="max-w-3xl mx-auto text-lg md:text-xl text-emerald-50/90 leading-relaxed">
                        {content?.hero?.subtitle}
                    </p>
                </div>

                {/* Wave separator */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 80" className="w-full h-12 md:h-16" preserveAspectRatio="none">
                        <path
                            d="M0,32 C320,80 720,0 1440,48 L1440,80 L0,80 Z"
                            className="fill-background"
                        />
                    </svg>
                </div>
            </section>

            {/* COMMITMENT */}
            <section className="py-16 md:py-24 bg-background">
                <div
                    ref={commitmentRef.ref}
                    className={`container mx-auto px-4 max-w-4xl transition-all duration-700 ${
                        commitmentRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Leaf className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                            {content?.commitment?.title || "Our Commitment"}
                        </h2>
                    </div>
                    <div className="space-y-5 text-base md:text-lg text-muted-foreground leading-relaxed">
                        {(content?.commitment?.paragraphs || []).map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                </div>
            </section>

            {/* FRAMEWORK */}
            {(content?.framework?.intro || standards.length > 0) && (
                <section className="py-16 md:py-24 bg-gradient-to-b from-emerald-50/50 to-background dark:from-emerald-950/10">
                    <div
                        ref={frameworkRef.ref}
                        className={`container mx-auto px-4 transition-all duration-700 ${
                            frameworkRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                {content?.framework?.title || "Sustainability Framework"}
                            </h2>
                            <p className="text-muted-foreground text-lg">{content?.framework?.intro}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {standards.map((s, idx) => (
                                <Card
                                    key={s._id || idx}
                                    className="group relative overflow-hidden border-emerald-200/50 dark:border-emerald-800/40 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1"
                                    style={{ transitionDelay: `${idx * 0.05}s` }}
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                                    <CardContent className="p-6">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Award className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <div className="font-bold text-lg text-foreground mb-1">{s.code}</div>
                                        <div className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">{s.name}</div>
                                        {s.description && (
                                            <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {content?.framework?.outro && (
                            <p className="text-center text-muted-foreground max-w-3xl mx-auto mt-12 text-base md:text-lg">
                                {content.framework.outro}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* FOCUS AREAS */}
            {focusItems.length > 0 && (
                <section className="py-16 md:py-24 bg-background">
                    <div
                        ref={focusRef.ref}
                        className={`container mx-auto px-4 transition-all duration-700 ${
                            focusRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
                                <Sparkles className="h-3.5 w-3.5" />
                                KEY FOCUS AREAS
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                {content?.focusAreas?.title}
                            </h2>
                            <p className="text-muted-foreground text-lg">{content?.focusAreas?.subtitle}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                            {focusItems.map((item, idx) => (
                                <Card
                                    key={item._id || idx}
                                    className="group border-border/50 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1"
                                    style={{ transitionDelay: `${idx * 0.05}s` }}
                                >
                                    <CardContent className="p-7">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                            <div className="text-white">{renderIcon(item.icon, "h-7 w-7")}</div>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed text-sm">{item.description}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* SUSTAINABILITY TARGETS */}
            {targetItems.length > 0 && (
                <section className="py-16 md:py-24 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 text-white relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-300/10 rounded-full blur-3xl" />
                    </div>

                    <div
                        ref={targetsRef.ref}
                        className={`relative container mx-auto px-4 transition-all duration-700 ${
                            targetsRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                {content?.targets?.title}
                            </h2>
                            <p className="text-emerald-50/90 text-lg">{content?.targets?.subtitle}</p>
                        </div>

                        <div className="relative max-w-6xl mx-auto">
                            {/* Connecting dotted line (desktop) */}
                            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-white/30" />

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 relative">
                                {targetItems.map((item, idx) => (
                                    <div
                                        key={item._id || idx}
                                        className="text-center"
                                        style={{ transitionDelay: `${idx * 0.08}s` }}
                                    >
                                        <div className="relative inline-block mb-4">
                                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-emerald-700 text-xs font-bold flex items-center justify-center shadow-lg z-10">
                                                {String(idx + 1).padStart(2, "0")}
                                            </div>
                                            <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:scale-110 hover:bg-white/20 transition-all">
                                                <div className="text-white">{renderIcon(item.icon, "h-9 w-9")}</div>
                                            </div>
                                        </div>
                                        <h3 className="text-base font-bold mb-2 uppercase tracking-wide">{item.title}</h3>
                                        <p className="text-xs md:text-sm text-emerald-50/80 leading-relaxed">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* PROJECT IMPLEMENTATION */}
            {steps.length > 0 && (
                <section className="py-16 md:py-24 bg-background">
                    <div
                        ref={implRef.ref}
                        className={`container mx-auto px-4 transition-all duration-700 ${
                            implRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="text-center max-w-3xl mx-auto mb-14">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
                                <ClipboardList className="h-3.5 w-3.5" />
                                PROJECT LIFECYCLE
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                {content?.implementation?.title}
                            </h2>
                            <p className="text-muted-foreground text-lg">{content?.implementation?.subtitle}</p>
                        </div>

                        <div className="max-w-7xl mx-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 lg:gap-2 relative">
                                {steps.map((step, idx) => (
                                    <div key={step._id || idx} className="relative">
                                        {/* Arrow connector (desktop) */}
                                        {idx < steps.length - 1 && (
                                            <div className="hidden lg:block absolute top-12 -right-2 z-10">
                                                <ArrowRight className="h-5 w-5 text-emerald-500/50" />
                                            </div>
                                        )}
                                        <Card className="h-full border-border/50 hover:border-emerald-500/50 hover:shadow-lg transition-all group">
                                            <CardContent className="p-5 text-center">
                                                <div className="relative inline-flex mb-4">
                                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <div className="text-emerald-600 dark:text-emerald-400">
                                                            {renderIcon(step.icon, "h-7 w-7")}
                                                        </div>
                                                    </div>
                                                    <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                                                        {String(idx + 1).padStart(2, "0")}
                                                    </div>
                                                </div>
                                                <h3 className="font-bold text-foreground text-sm md:text-base mb-2 uppercase tracking-wide">
                                                    {step.title}
                                                </h3>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ALTERNATIVES */}
            {alternatives.length > 0 && (
                <section className="py-16 md:py-24 bg-muted/30">
                    <div
                        ref={altRef.ref}
                        className={`container mx-auto px-4 transition-all duration-700 ${
                            altRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-4">
                                <Sparkles className="h-3.5 w-3.5" />
                                SUSTAINABLE ALTERNATIVES
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                                {content?.alternatives?.title}
                            </h2>
                            <p className="text-muted-foreground text-lg">{content?.alternatives?.subtitle}</p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <Accordion type="single" collapsible className="space-y-3">
                                {alternatives.map((alt, idx) => (
                                    <AccordionItem
                                        key={alt._id || idx}
                                        value={`alt-${idx}`}
                                        className="bg-card border border-border/50 rounded-xl px-5 data-[state=open]:border-emerald-500/50 data-[state=open]:shadow-lg data-[state=open]:shadow-emerald-500/5 transition-all"
                                    >
                                        <AccordionTrigger className="hover:no-underline py-5">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 flex items-center justify-center">
                                                    <div className="text-emerald-600 dark:text-emerald-400">
                                                        {renderIcon(alt.icon, "h-5 w-5")}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-0.5">
                                                        {String(idx + 1).padStart(2, "0")}
                                                    </div>
                                                    <div className="font-semibold text-base md:text-lg text-foreground">
                                                        {alt.title}
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed pl-16 pr-4 pb-5">
                                            {alt.description}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>
            )}

            {/* CONTINUOUS IMPROVEMENT */}
            {content?.continuousImprovement?.paragraphs && content.continuousImprovement.paragraphs.length > 0 && (
                <section className="py-16 md:py-24 bg-background">
                    <div
                        ref={improvementRef.ref}
                        className={`container mx-auto px-4 max-w-4xl transition-all duration-700 ${
                            improvementRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    >
                        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/50 dark:border-emerald-800/40 overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                                        {content.continuousImprovement.title || "Continuous Improvement"}
                                    </h2>
                                </div>
                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    {content.continuousImprovement.paragraphs.map((p, i) => (
                                        <p key={i}>{p}</p>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}

            {/* DOCUMENTS */}
            {documents.length > 0 && (
                <section className="py-16 md:py-24 bg-muted/30">
                    <div
                        ref={docsRef.ref}
                        className={`container mx-auto px-4 transition-all duration-700 ${
                            docsRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    >
                        <div className="text-center max-w-2xl mx-auto mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Download Documents</h2>
                            <p className="text-muted-foreground">Access our full sustainability policy and proposal documents.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                            {documents.map((doc, idx) => (
                                <a
                                    key={doc._id || idx}
                                    href={toAbsoluteFileUrl(doc.file || "#")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                >
                                    <Card className="h-full hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all border-border/50 hover:border-emerald-500/50">
                                        <CardContent className="p-6 flex items-center gap-5">
                                            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                <FileText className="h-7 w-7 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-foreground mb-1 truncate">
                                                    {doc.name}
                                                </div>
                                                {doc.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{doc.description}</p>
                                                )}
                                            </div>
                                            <Download className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                                        </CardContent>
                                    </Card>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* DISCLAIMER */}
            {content?.disclaimer && (
                <section className="py-12 bg-background">
                    <div className="container mx-auto px-4 max-w-4xl">
                        <div className="flex items-start gap-4 p-6 rounded-xl border border-border bg-muted/40">
                            <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                                    Disclaimer
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed italic">{content.disclaimer}</p>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-16 md:py-20 bg-background">
                <div
                    ref={ctaRef.ref}
                    className={`container mx-auto px-4 transition-all duration-700 ${
                        ctaRef.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-800 p-10 md:p-16 text-center text-white max-w-5xl mx-auto">
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
                        </div>
                        <div className="relative">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 text-sm font-medium mb-6">
                                <Leaf className="h-4 w-4" />
                                Sustainable Partnership
                            </div>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                                Build Responsibly With Promach
                            </h2>
                            <p className="text-emerald-50/90 max-w-2xl mx-auto mb-8 text-lg">
                                Partner with a contractor committed to environmental compliance, quality, and continuous improvement.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/contact">
                                    <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 rounded-full shadow-lg">
                                        Get In Touch
                                    </Button>
                                </Link>
                                <Link to="/about">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-full border-white/30 bg-white/10 text-white hover:bg-white/20"
                                    >
                                        Learn About Us
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

export default Sustainability;
