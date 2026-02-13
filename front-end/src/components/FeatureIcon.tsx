import { LucideIcon } from "lucide-react";

interface FeatureIconProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

const FeatureIcon = ({ icon: Icon, title, description }: FeatureIconProps) => {
  return (
    <div className="relative flex flex-col items-center text-center group p-6 sm:p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
      {/* Accent gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

      {/* Icon */}
      <div className="w-16 h-16 sm:w-18 sm:h-18 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-500 ring-1 ring-primary/5">
        <Icon className="text-primary" size={30} strokeWidth={1.5} />
      </div>

      <h3 className="font-bold text-base sm:text-lg tracking-tight text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[240px]">
          {description}
        </p>
      )}
    </div>
  );
};

export default FeatureIcon;
