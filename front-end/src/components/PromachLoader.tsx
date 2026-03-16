import logo from "@/assets/LOGO.png";

interface PromachLoaderProps {
  /** "fullscreen" for page-level, "inline" for inside cards/sections */
  variant?: "fullscreen" | "inline";
  /** Optional text below the logo */
  text?: string;
}

/**
 * Branded Promach loader with animated logo and PROMACH text.
 * Used across landing pages and admin console for consistent branding.
 */
export default function PromachLoader({ variant = "fullscreen", text }: PromachLoaderProps) {
  if (variant === "inline") {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="absolute -inset-3 bg-primary/10 rounded-full animate-ping opacity-40" />
          <img
            src={logo}
            alt="Promach"
            className="relative h-12 w-auto object-contain animate-pulse"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold tracking-widest text-primary">PROMACH</span>
          <span className="flex gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
          </span>
        </div>
        {text && <p className="text-xs text-muted-foreground">{text}</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-5">
      <div className="relative flex flex-col items-center gap-4">
        {/* Outer glow ring */}
        <div className="absolute -inset-6 bg-primary/5 rounded-full animate-ping opacity-30" />
        <div className="absolute -inset-4 bg-primary/10 rounded-full animate-pulse" />

        {/* Logo */}
        <img
          src={logo}
          alt="Promach"
          className="relative h-16 w-auto object-contain drop-shadow-lg"
        />

        {/* Brand name */}
        <div className="relative flex items-center gap-2">
          <span className="text-lg font-bold tracking-[0.3em] text-primary">PROMACH</span>
        </div>

        {/* Animated loading bar */}
        <div className="w-40 h-1 bg-slate-200 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-primary via-primary/60 to-primary rounded-full animate-loading-bar" />
        </div>

        {text && (
          <p className="text-sm text-muted-foreground mt-1">{text}</p>
        )}
      </div>
    </div>
  );
}
