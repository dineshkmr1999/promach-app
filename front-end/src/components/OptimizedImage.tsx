import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  sizes?: string;
}

/**
 * OptimizedImage Component
 * Features:
 * - Lazy loading with Intersection Observer
 * - Blur placeholder while loading
 * - Error handling with fallback
 * - Smooth fade-in animation
 * - SEO-friendly with proper alt tags
 */
const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = "",
  containerClassName = "",
  priority = false,
  placeholder = "blur",
  blurDataURL,
  onLoad,
  onError,
  objectFit = "cover",
  sizes,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate a simple blur placeholder
  const defaultBlurDataURL =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4=";

  const objectFitClass = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    none: "object-none",
    "scale-down": "object-scale-down",
  }[objectFit];

  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={cn(
          "bg-muted flex items-center justify-center",
          containerClassName
        )}
        style={{ width, height }}
      >
        <div className="text-center p-4">
          <div className="w-12 h-12 mx-auto mb-2 bg-muted-foreground/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <p className="text-xs text-muted-foreground">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", containerClassName)}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === "blur" && !isLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-110 transition-opacity duration-300"
          style={{
            backgroundImage: `url(${blurDataURL || defaultBlurDataURL})`,
            opacity: isLoaded ? 0 : 1,
          }}
        />
      )}

      {/* Skeleton placeholder */}
      {placeholder === "empty" && !isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Actual image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          sizes={sizes}
          className={cn(
            "transition-opacity duration-500",
            objectFitClass,
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          style={{
            width: width ? `${width}px` : "100%",
            height: height ? `${height}px` : "100%",
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;

/**
 * Hook for preloading critical images
 */
export const useImagePreload = (src: string) => {
  useEffect(() => {
    const img = new Image();
    img.src = src;
  }, [src]);
};

/**
 * Generate srcset for responsive images
 * Usage: generateSrcSet('/images/hero', [320, 640, 1024, 1920], 'jpg')
 */
export const generateSrcSet = (
  basePath: string,
  widths: number[],
  extension: string = "jpg"
): string => {
  return widths
    .map((w) => `${basePath}-${w}w.${extension} ${w}w`)
    .join(", ");
};
