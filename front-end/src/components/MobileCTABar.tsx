import { useState } from "react";
import { Phone, MessageCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPANY_INFO } from "@/constants";
import { QuickQuoteModal } from "./QuickQuoteModal";

interface MobileCTABarProps {
    className?: string;
}

export function MobileCTABar({ className }: MobileCTABarProps) {
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

    const handleCall = () => {
        window.location.href = COMPANY_INFO.phoneHref;
    };

    const handleWhatsApp = () => {
        const message = "Hi, I'm interested in your services. Please contact me.";
        const whatsappUrl = `https://wa.me/6568292136?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
    };

    return (
        <>
            {/* Fixed Bottom CTA Bar - Only visible on mobile */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 md:hidden",
                    "bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]",
                    "safe-area-inset-bottom",
                    className
                )}
            >
                <div className="grid grid-cols-3 divide-x divide-slate-200">
                    {/* Call Button */}
                    <button
                        onClick={handleCall}
                        className="flex flex-col items-center justify-center py-3 px-2 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        aria-label="Call us"
                    >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                            <Phone size={20} className="text-primary" />
                        </div>
                        <span className="text-xs font-medium text-slate-700">Call Now</span>
                    </button>

                    {/* WhatsApp Button */}
                    <button
                        onClick={handleWhatsApp}
                        className="flex flex-col items-center justify-center py-3 px-2 hover:bg-green-50 active:bg-green-100 transition-colors"
                        aria-label="WhatsApp us"
                    >
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-1">
                            <MessageCircle size={20} className="text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-700">WhatsApp</span>
                    </button>

                    {/* Get Quote Button */}
                    <button
                        onClick={() => setIsQuoteModalOpen(true)}
                        className="flex flex-col items-center justify-center py-3 px-2 bg-primary hover:bg-primary/90 active:bg-primary/80 transition-colors"
                        aria-label="Get a quote"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-1">
                            <FileText size={20} className="text-white" />
                        </div>
                        <span className="text-xs font-medium text-white">Get Quote</span>
                    </button>
                </div>
            </div>

            {/* Spacer to prevent content from being hidden behind the bar */}
            <div className="h-20 md:hidden" />

            {/* Quick Quote Modal */}
            <QuickQuoteModal
                open={isQuoteModalOpen}
                onOpenChange={setIsQuoteModalOpen}
            />
        </>
    );
}

export default MobileCTABar;
