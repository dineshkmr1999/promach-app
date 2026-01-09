import { useState } from "react";
import { MapPin } from "lucide-react";

interface GoogleMapProps {
  lat: number;
  lng: number;
  title?: string;
  zoom?: number;
  height?: string;
  className?: string;
}

/**
 * Google Maps Embed Component
 * Uses Google Maps Embed API (free, no API key required for basic embeds)
 * For advanced features, consider using @react-google-maps/api with an API key
 */
const GoogleMap = ({
  lat,
  lng,
  title = "Location",
  zoom = 15,
  height = "300px",
  className = "",
}: GoogleMapProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Google Maps Embed URL (no API key required for basic embed)
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM8KwMTcnMzUuMiJOIDEwM8KwNTEnMjguMSJF!5e0!3m2!1sen!2ssg!4v1`;

  // Alternative: Use place search embed (more reliable)
  const placeSearchUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Suntec+Tower+Three,Singapore&zoom=${zoom}`;

  // Fallback: OpenStreetMap embed (no API key needed)
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.005}%2C${lng + 0.005}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`;

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Google Maps directions link
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  if (hasError) {
    return (
      <div
        className={`bg-muted rounded-lg flex flex-col items-center justify-center ${className}`}
        style={{ height }}
      >
        <MapPin className="text-primary mb-2" size={32} />
        <p className="text-muted-foreground text-sm mb-3">Unable to load map</p>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline text-sm font-medium"
        >
          Open in Google Maps →
        </a>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-10">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-muted-foreground text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map iframe */}
      <iframe
        src={osmUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={title}
        onLoad={handleLoad}
        onError={handleError}
        className="w-full h-full"
      />

      {/* Overlay with directions link */}
      <div className="absolute bottom-3 right-3 z-20">
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white/95 backdrop-blur-sm text-primary hover:bg-white px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <MapPin size={16} />
          Get Directions
        </a>
      </div>
    </div>
  );
};

export default GoogleMap;
