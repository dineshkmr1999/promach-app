import { LucideIcon } from "lucide-react";

interface FeatureIconProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

const FeatureIcon = ({ icon: Icon, title, description }: FeatureIconProps) => {
  return (
    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 group p-4 sm:p-6 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 hover-scale">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-sm">
        <Icon className="text-primary" size={32} strokeWidth={1.5} />
      </div>
      <h3 className="font-bold text-base sm:text-lg tracking-tight text-foreground">{title}</h3>
      {description && <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-[220px] sm:max-w-[250px]">{description}</p>}
    </div>
  );
};

export default FeatureIcon;
