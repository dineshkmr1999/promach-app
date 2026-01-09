import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Phone, FileText, Award, DollarSign, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingAssistant = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);

    // Hide on admin routes
    const isAdminPage = location.pathname.startsWith('/admin');

    useEffect(() => {
        // Hide welcome message after 8 seconds
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 8000);
        return () => clearTimeout(timer);
    }, []);


    const handleToggle = () => {
        if (isOpen) {
            setShowOptions(false);
            setTimeout(() => setIsOpen(false), 200);
        } else {
            setIsOpen(true);
            setShowWelcome(false);
            setTimeout(() => setShowOptions(true), 100);
        }
    };

    const options = [
        {
            icon: FileText,
            label: "Request a Quote",
            link: "/booking",
            color: "from-primary/10 to-primary/5",
            hoverColor: "hover:from-primary/20 hover:to-primary/10",
        },
        {
            icon: Phone,
            label: "Call Our Team",
            link: "tel:+6568292136",
            color: "from-green-50 to-green-100",
            hoverColor: "hover:from-green-100 hover:to-green-200",
            external: true,
        },
        {
            icon: DollarSign,
            label: "View Pricing",
            link: "/aircon-services",
            color: "from-blue-50 to-blue-100",
            hoverColor: "hover:from-blue-100 hover:to-blue-200",
        },
        {
            icon: Award,
            label: "Our Certifications",
            link: "/#certificates",
            color: "from-amber-50 to-amber-100",
            hoverColor: "hover:from-amber-100 hover:to-amber-200",
        },
    ];

    // Don't render on admin pages
    if (isAdminPage) {
        return null;
    }

    return (
        <>
            {/* Floating Assistant Button */}
            <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 animate-fade-in">
                {/* Welcome Message Bubble */}
                {showWelcome && !isOpen && (
                    <div className="animate-slide-in-right bg-white shadow-2xl rounded-2xl p-4 max-w-[280px] border border-primary/10 mb-2">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                                <Wind size={20} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 mb-1">Hi! I'm your AC Assistant 👋</p>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Need help with cooling solutions? Click me for quick access to quotes, pricing & more!
                                </p>
                            </div>
                            <button
                                onClick={() => setShowWelcome(false)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Options Menu */}
                {isOpen && (
                    <div className={`flex flex-col gap-2 transition-all duration-300 ${showOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                        {options.map((option, index) => (
                            <div
                                key={option.label}
                                className="animate-slide-in-right"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {option.external ? (
                                    <a
                                        href={option.link}
                                        className={`flex items-center gap-3 bg-gradient-to-r ${option.color} ${option.hoverColor} backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group min-w-[200px]`}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <option.icon size={20} className="text-primary" />
                                        </div>
                                        <span className="font-medium text-sm text-slate-700 pr-2">{option.label}</span>
                                    </a>
                                ) : (
                                    <Link
                                        to={option.link}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 bg-gradient-to-r ${option.color} ${option.hoverColor} backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group min-w-[200px]`}
                                    >
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                            <option.icon size={20} className="text-primary" />
                                        </div>
                                        <span className="font-medium text-sm text-slate-700 pr-2">{option.label}</span>
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Main Assistant Button with AC Character */}
                <button
                    onClick={handleToggle}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 group ${isOpen ? 'rotate-0' : 'hover:rotate-12'} overflow-hidden`}
                    aria-label="Virtual Assistant"
                >
                    {isOpen ? (
                        <X className="absolute inset-0 m-auto text-white z-10" size={28} />
                    ) : (
                        <>
                            {/* AC Character - Simple Wind Icon with Animation */}
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="relative">
                                    <Wind className="text-white animate-pulse-subtle" size={36} />
                                    {/* Cooling effect lines */}
                                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                        <div className="w-2 h-0.5 bg-white/60 rounded animate-pulse" style={{ animationDelay: '0s' }} />
                                        <div className="w-3 h-0.5 bg-white/60 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                                        <div className="w-2 h-0.5 bg-white/60 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Ripple Effect */}
                    <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                </button>

                {/* Tooltip */}
                {!isOpen && !showWelcome && (
                    <div className="absolute right-20 sm:right-24 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none hidden sm:block">
                        Need Help? Click me!
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-slate-900" />
                    </div>
                )}
            </div>
        </>
    );
};

export default FloatingAssistant;
