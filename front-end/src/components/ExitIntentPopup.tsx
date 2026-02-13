import { useState, useEffect, useCallback } from "react";
import { X, Gift, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ExitIntentPopupProps {
    onClose?: () => void;
    onSubmit?: (email: string) => void;
}

export function ExitIntentPopup({ onClose, onSubmit }: ExitIntentPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [hasShown, setHasShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleClose = useCallback(() => {
        setIsVisible(false);
        onClose?.();
        // Don't show again this session
        sessionStorage.setItem("exitIntentShown", "true");
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        try {
            onSubmit?.(email);
            setIsSuccess(true);
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (error) {
            console.error("Submission error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        // Check if already shown this session
        if (sessionStorage.getItem("exitIntentShown")) {
            return;
        }

        const handleMouseLeave = (e: MouseEvent) => {
            // Only trigger when mouse leaves from top of viewport
            if (e.clientY <= 0 && !hasShown) {
                setIsVisible(true);
                setHasShown(true);
            }
        };

        // Delay adding the listener to avoid triggering on page load
        const timeout = setTimeout(() => {
            document.addEventListener("mouseleave", handleMouseLeave);
        }, 5000); // Wait 5 seconds before enabling

        return () => {
            clearTimeout(timeout);
            document.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [hasShown]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={handleClose}
            />

            {/* Popup */}
            <div
                className={cn(
                    "relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden",
                    "animate-scale-in"
                )}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors z-10"
                    aria-label="Close"
                >
                    <X size={18} className="text-slate-600" />
                </button>

                {/* Content */}
                <div className="p-8">
                    {!isSuccess ? (
                        <>
                            {/* Icon */}
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Gift size={32} className="text-primary" />
                            </div>

                            {/* Heading */}
                            <h3 className="text-2xl font-bold text-slate-900 text-center mb-2">
                                Wait! Don't Leave Yet
                            </h3>

                            <p className="text-slate-600 text-center mb-6">
                                Get <strong className="text-primary">$20 OFF</strong> your first
                                service when you book with us!
                            </p>

                            {/* Urgency */}
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-6">
                                <Clock size={16} />
                                <span>Offer expires in 24 hours</span>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 text-center"
                                    required
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-base font-semibold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        "Sending..."
                                    ) : (
                                        <>
                                            Claim My $20 Discount
                                            <ArrowRight size={18} className="ml-2" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <button
                                onClick={handleClose}
                                className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                No thanks, I don't want to save money
                            </button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Gift size={32} className="text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                Discount Code Sent! 🎉
                            </h3>
                            <p className="text-slate-600">
                                Check your email for your exclusive $20 discount code.
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Banner */}
                <div className="bg-slate-50 border-t px-6 py-3 text-center">
                    <p className="text-xs text-slate-500">
                        Join 5,000+ happy customers • No spam, ever
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ExitIntentPopup;
