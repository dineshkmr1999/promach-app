import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const ServiceCard = ({ icon: Icon, title, description, buttonText, buttonLink }: ServiceCardProps) => {
  return (
    <Card className="group hover-lift hover:shadow-xl transition-all duration-500 border-border/50 hover:border-primary/20 overflow-hidden bg-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="text-center relative z-10 pt-8 px-4 sm:px-6">
        <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-primary/10">
          <Icon className="text-primary" size={36} strokeWidth={1.5} />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight mb-2">{title}</CardTitle>
        <CardDescription className="text-sm sm:text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="text-center relative z-10 pb-8 px-4 sm:px-6">
        <Link to={buttonLink}>
          <Button
            variant="outline"
            className="rounded-full px-6 sm:px-8 py-2 sm:py-2.5 text-sm sm:text-base border-primary/20 hover:bg-primary hover:text-white transition-all duration-300 group-hover:border-primary/50 min-h-[44px] touch-manipulation"
          >
            {buttonText}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
