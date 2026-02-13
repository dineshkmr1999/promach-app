import { Shield, Award, Clock, Users, Star, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadge {
    icon: React.ElementType;
    label: string;
    value?: string;
}

const DEFAULT_BADGES: TrustBadge[] = [
    { icon: Clock, label: "Years Experience", value: "13+" },
    { icon: Users, label: "Happy Customers", value: "5,000+" },
    { icon: Award, label: "ISO Certified", value: "4x" },
    { icon: Shield, label: "BCA Registered" },
];

interface TrustBadgesProps {
    badges?: TrustBadge[];
    variant?: "default" | "compact" | "inline";
    className?: string;
}

export function TrustBadges({
    badges = DEFAULT_BADGES,
    variant = "default",
    className,
}: TrustBadgesProps) {
    if (variant === "inline") {
        return (
            <div className={cn("flex flex-wrap items-center gap-4 justify-center", className)}>
                {badges.map((badge, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-600"
                    >
                        <badge.icon size={16} className="text-primary" />
                        <span>
                            {badge.value && <strong className="text-slate-900">{badge.value}</strong>}{" "}
                            {badge.label}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <div className={cn("flex flex-wrap gap-2", className)}>
                {badges.map((badge, index) => (
                    <div
                        key={index}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm"
                    >
                        <badge.icon size={14} className="text-primary" />
                        <span className="font-medium text-slate-700">
                            {badge.value || badge.label}
                        </span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6",
                className
            )}
        >
            {badges.map((badge, index) => (
                <div
                    key={index}
                    className="flex flex-col items-center text-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <badge.icon size={24} className="text-primary" />
                    </div>
                    {badge.value && (
                        <span className="text-2xl font-bold text-slate-900 mb-1">
                            {badge.value}
                        </span>
                    )}
                    <span className="text-sm text-slate-600">{badge.label}</span>
                </div>
            ))}
        </div>
    );
}

// Guarantee badges for conversion points
const GUARANTEE_BADGES = [
    { icon: CheckCircle, label: "Satisfaction Guaranteed" },
    { icon: Shield, label: "Licensed & Insured" },
    { icon: Star, label: "Transparent Pricing" },
];

interface GuaranteeBadgesProps {
    className?: string;
}

export function GuaranteeBadges({ className }: GuaranteeBadgesProps) {
    return (
        <div className={cn("flex flex-wrap items-center justify-center gap-x-6 gap-y-2", className)}>
            {GUARANTEE_BADGES.map((badge, index) => (
                <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-slate-600"
                >
                    <badge.icon size={16} className="text-green-600" />
                    <span>{badge.label}</span>
                </div>
            ))}
        </div>
    );
}

export default TrustBadges;
