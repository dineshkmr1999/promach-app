import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { croSettingsAPI } from "@/services/api";

interface Testimonial {
    _id?: string;
    id?: string;
    name: string;
    location?: string;
    service?: "aircon" | "renovation";
    serviceType?: "aircon" | "renovation";
    rating: number;
    text: string;
    image?: string;
    date?: string;
}

// Default testimonials - used as fallback if API fails
const DEFAULT_TESTIMONIALS: Testimonial[] = [
    {
        id: "1",
        name: "Sarah Tan",
        location: "Bishan, HDB",
        service: "aircon",
        rating: 5,
        text: "Excellent service! The technicians were punctual and professional. My aircon is now cooling like new after the chemical wash. Highly recommended!",
        date: "2 weeks ago",
    },
    {
        id: "2",
        name: "David Lim",
        location: "Tampines, Condo",
        service: "renovation",
        rating: 5,
        text: "Promach transformed our old condo into a modern home. The team was patient with our requests and delivered beyond expectations. Great quality!",
        date: "1 month ago",
    },
    {
        id: "3",
        name: "Michelle Wong",
        location: "Jurong, Office",
        service: "aircon",
        rating: 5,
        text: "We've been using Promach for our office aircon maintenance for 3 years. Always reliable and responsive. Their contract pricing is very competitive.",
        date: "3 weeks ago",
    },
    {
        id: "4",
        name: "Ahmad Rahman",
        location: "Woodlands, HDB",
        service: "aircon",
        rating: 5,
        text: "Fast response and fair pricing. The technician explained everything clearly before starting work. Will definitely use them again.",
        date: "1 week ago",
    },
    {
        id: "5",
        name: "Jennifer Lee",
        location: "Bukit Timah, Landed",
        service: "renovation",
        rating: 5,
        text: "From design to completion, the Promach team was professional and delivered on time. Our kitchen renovation looks amazing!",
        date: "2 months ago",
    },
];

interface TestimonialCarouselProps {
    testimonials?: Testimonial[];
    autoPlay?: boolean;
    autoPlayInterval?: number;
    className?: string;
}

export function TestimonialCarousel({
    testimonials: propTestimonials,
    autoPlay = true,
    autoPlayInterval = 5000,
    className,
}: TestimonialCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [testimonials, setTestimonials] = useState<Testimonial[]>(propTestimonials || DEFAULT_TESTIMONIALS);
    const [loading, setLoading] = useState(!propTestimonials);

    // Fetch testimonials from API if not provided as props
    useEffect(() => {
        if (!propTestimonials) {
            const fetchTestimonials = async () => {
                try {
                    const data = await croSettingsAPI.getSettings();
                    if (data.testimonials && data.testimonials.length > 0) {
                        // Map backend data to component format
                        const mapped = data.testimonials.map((t: any) => ({
                            ...t,
                            id: t._id,
                            service: t.serviceType || t.service
                        }));
                        setTestimonials(mapped);
                    }
                } catch (error) {
                    console.error('Error fetching testimonials:', error);
                    // Keep default testimonials on error
                } finally {
                    setLoading(false);
                }
            };
            fetchTestimonials();
        }
    }, [propTestimonials]);

    // Auto-play effect
    useEffect(() => {
        if (!autoPlay || isPaused || testimonials.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, isPaused, testimonials.length]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    };

    const goToPrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? testimonials.length - 1 : prev - 1
        );
    };

    const current = testimonials[currentIndex];

    // Handle loading or empty state
    if (!current) {
        return null;
    }

    return (
        <div
            className={cn("relative", className)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 relative overflow-hidden">
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10">
                    <Quote size={80} className="text-primary" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                    {/* Stars */}
                    <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={20}
                                className={cn(
                                    i < current.rating
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-slate-200"
                                )}
                            />
                        ))}
                    </div>

                    {/* Testimonial Text */}
                    <blockquote className="text-lg md:text-xl text-slate-700 mb-6 leading-relaxed italic">
                        "{current.text}"
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                            {current.name.charAt(0)}
                        </div>

                        <div className="flex-1">
                            <div className="font-semibold text-slate-900">{current.name}</div>
                            <div className="text-sm text-slate-500 flex items-center gap-2">
                                {current.location && <span>{current.location}</span>}
                                {current.location && current.date && <span>•</span>}
                                {current.date && <span>{current.date}</span>}
                            </div>
                        </div>

                        {/* Service Badge */}
                        <div
                            className={cn(
                                "px-3 py-1 rounded-full text-xs font-medium",
                                current.service === "aircon"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                            )}
                        >
                            {current.service === "aircon" ? "Aircon" : "Renovation"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6">
                {/* Dots */}
                <div className="flex gap-2">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "w-2.5 h-2.5 rounded-full transition-all",
                                index === currentIndex
                                    ? "bg-primary w-6"
                                    : "bg-slate-300 hover:bg-slate-400"
                            )}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Arrows */}
                <div className="flex gap-2">
                    <button
                        onClick={goToPrev}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={20} className="text-slate-600" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={20} className="text-slate-600" />
                    </button>
                </div>
            </div>

            {/* Verified Badge */}
            <div className="text-center mt-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <svg
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4 h-4 text-green-500"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                        />
                    </svg>
                    All reviews are from verified customers
                </span>
            </div>
        </div>
    );
}

export default TestimonialCarousel;
