// Shared constants for Promach website
// Centralized configuration for SEO, contact info, and business data

// ============================================
// BUSINESS INFORMATION
// ============================================
export const COMPANY_INFO = {
  name: "Promach Pte Ltd",
  shortName: "PROMACH",
  tagline: "Your trusted partner for ACMV services and premium renovation solutions in Singapore",
  foundedYear: 2011,
  registrationNumber: "", // Add UEN if available
  
  // Contact Details
  phone: "+65 6829 2136",
  phoneDisplay: "(65) 6829 2136",
  phoneHref: "tel:+6568292136",
  
  email: "enquiry@promachpl.com",
  emailHref: "mailto:enquiry@promachpl.com",
  
  // WhatsApp (update when ready)
  whatsapp: "",
  whatsappHref: "",
  
  // Address
  address: {
    street: "8 Temasek Boulevard, Level 42",
    building: "Suntec Tower Three",
    city: "Singapore",
    postalCode: "038988",
    country: "Singapore",
    full: "8 Temasek Boulevard, Level 42, Suntec Tower Three, Singapore 038988",
  },
  
  // Coordinates for Google Maps (Suntec Tower Three)
  coordinates: {
    lat: 1.2931,
    lng: 103.8578,
  },
  
  // Business Hours
  businessHours: {
    weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
    saturday: "Saturday: 9:00 AM - 1:00 PM",
    sunday: "Sunday: Closed",
    timezone: "Asia/Singapore",
  },
  
  // Social Media (add when available)
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
  },
} as const;

// ============================================
// SEO CONFIGURATION
// ============================================
export const SEO_CONFIG = {
  siteName: "Promach Pte Ltd",
  siteUrl: "https://www.promachpl.com", // Update with actual domain
  defaultTitle: "Promach - Professional Aircon & ACMV Services | Renovation Singapore",
  titleTemplate: "%s | Promach Singapore",
  
  defaultDescription: "Singapore's trusted ACMV and aircon servicing company. Professional air conditioning installation, maintenance, chemical wash, and renovation services for residential & commercial properties.",
  
  defaultKeywords: [
    "aircon servicing singapore",
    "ACMV services singapore",
    "air conditioning maintenance",
    "chemical wash aircon",
    "steam wash aircon",
    "aircon installation singapore",
    "renovation singapore",
    "commercial aircon servicing",
    "industrial HVAC singapore",
    "aircon repair singapore",
    "VRV system installation",
    "chiller maintenance singapore",
    "office renovation singapore",
    "HDB aircon servicing",
    "condo aircon maintenance",
  ],
  
  // Open Graph defaults
  og: {
    type: "website",
    locale: "en_SG",
    image: "/og-image.jpg", // Create this image (1200x630px)
    imageWidth: 1200,
    imageHeight: 630,
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@promachsg", // Update when available
  },
  
  // Geo targeting for Singapore
  geo: {
    region: "SG",
    placename: "Singapore",
    position: "1.2931;103.8578",
  },
} as const;

// Page-specific SEO data
export const PAGE_SEO = {
  home: {
    title: "Professional Aircon & ACMV Services | Renovation Singapore",
    description: "Promach offers expert ACMV installation, aircon servicing, chemical wash, and premium renovation solutions in Singapore. ISO certified. Book online 24/7.",
    keywords: ["aircon servicing singapore", "ACMV services", "renovation singapore", "air conditioning installation"],
  },
  airconServices: {
    title: "Aircon & ACMV Services - Servicing, Chemical Wash, Installation",
    description: "Professional aircon servicing from $43.60. Chemical wash, steam cleaning, installation & repair for all brands. Daikin, Mitsubishi, Panasonic certified technicians.",
    keywords: ["aircon servicing price singapore", "chemical wash aircon", "steam wash aircon", "aircon repair", "ACMV maintenance"],
  },
  renovation: {
    title: "Renovation & Interior Design Services Singapore",
    description: "Premium renovation and interior design for homes, offices, and commercial spaces. From concept to completion. Free consultation available.",
    keywords: ["renovation singapore", "interior design singapore", "office renovation", "HDB renovation", "commercial renovation"],
  },
  booking: {
    title: "Book Aircon Service Online - 24/7 Appointment System",
    description: "Book your aircon servicing appointment online. Fast, simple booking for normal servicing, chemical wash, steam wash, and repairs. Same-day slots available.",
    keywords: ["book aircon service", "aircon appointment singapore", "online booking aircon"],
  },
  about: {
    title: "About Promach - ISO Certified ACMV & Renovation Company",
    description: "Learn about Promach Pte Ltd - Singapore's trusted ACMV and renovation company since 2011. ISO 9001, 14001, 45001, 37001 certified. BizSafe Star awarded.",
    keywords: ["about promach", "ISO certified aircon company", "BizSafe Star", "singapore ACMV company"],
  },
  contact: {
    title: "Contact Us - Get a Free Quote",
    description: "Contact Promach for aircon servicing and renovation inquiries. Located at Suntec Tower Three, Singapore. Call (65) 6829 2136 or email us.",
    keywords: ["contact promach", "aircon service quote", "renovation quote singapore"],
  },
} as const;

// ============================================
// CERTIFICATES & ACCREDITATIONS
// ============================================
export const CERTIFICATES = [
  {
    name: "ISO 9001",
    description: "Quality Management System",
    file: "PROMACH PTE. LTD. 9001-Original.pdf",
    image: "ISO9001.png",
  },
  {
    name: "ISO 14001",
    description: "Environmental Management System",
    file: "1st Surveillance Certificate 14001 PROMACH PTE. LTD..pdf",
    image: "ISO14001.png",
  },
  {
    name: "ISO 45001",
    description: "Occupational Health & Safety",
    file: "PROMACH PTE. LTD. 45001-Original.pdf",
    image: "ISO45001.png",
  },
  {
    name: "ISO 37001",
    description: "Anti-Bribery Management System",
    file: "1st Surveillance Certificate 37001 PROMACH PTE. LTD_.pdf",
    image: "ISO37001.png",
  },
  {
    name: "BizSafe Star",
    description: "Workplace Safety & Health",
    file: "PROMACH PTE LTD  BIZ SAFE STAR.pdf",
    image: "", // Add if available
  },
] as const;

// Helper function to open certificate
export const openCertificate = (fileName: string) => {
  const url = `/certificates/${fileName}`;
  window.open(url, "_blank", "noopener,noreferrer");
};

// ============================================
// SERVICES DATA
// ============================================
export const AIRCON_BRANDS = [
  "Daikin",
  "Toshiba",
  "Panasonic",
  "Midea",
  "Mitsubishi Electric",
  "Mitsubishi Heavy Industries",
  "Gree",
  "York",
  "Dunham-Bush",
] as const;

export const PROPERTY_TYPES = [
  { value: "hdb", label: "HDB" },
  { value: "condo", label: "Condo" },
  { value: "apartment", label: "Apartment" },
  { value: "landed", label: "Landed Property" },
  { value: "office", label: "Office" },
  { value: "shoplot", label: "Shoplot" },
  { value: "industrial", label: "Industrial" },
  { value: "others", label: "Others" },
] as const;

export const SERVICE_TYPES = [
  { value: "normal", label: "Normal Servicing" },
  { value: "chemical", label: "Chemical Wash" },
  { value: "steam", label: "Steam Wash" },
  { value: "overhaul", label: "Chemical Overhaul" },
  { value: "repair", label: "Repair Call" },
  { value: "installation", label: "Installation" },
  { value: "contract", label: "Contract Sign-Up" },
] as const;

export const TIME_SLOTS = [
  { value: "9-10", label: "9:00 AM - 10:00 AM" },
  { value: "10-12", label: "10:00 AM - 12:00 PM" },
  { value: "12-2", label: "12:00 PM - 2:00 PM" },
  { value: "2-4", label: "2:00 PM - 4:00 PM" },
  { value: "4-6", label: "4:00 PM - 6:00 PM" },
  { value: "6-7", label: "6:00 PM - 7:00 PM" },
] as const;

// ============================================
// STRUCTURED DATA (JSON-LD) FOR SEO
// ============================================
export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SEO_CONFIG.siteUrl}/#organization`,
  name: COMPANY_INFO.name,
  alternateName: COMPANY_INFO.shortName,
  description: SEO_CONFIG.defaultDescription,
  url: SEO_CONFIG.siteUrl,
  telephone: COMPANY_INFO.phone,
  email: COMPANY_INFO.email,
  foundingDate: COMPANY_INFO.foundedYear.toString(),
  
  address: {
    "@type": "PostalAddress",
    streetAddress: COMPANY_INFO.address.street,
    addressLocality: COMPANY_INFO.address.city,
    postalCode: COMPANY_INFO.address.postalCode,
    addressCountry: "SG",
  },
  
  geo: {
    "@type": "GeoCoordinates",
    latitude: COMPANY_INFO.coordinates.lat,
    longitude: COMPANY_INFO.coordinates.lng,
  },
  
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "13:00",
    },
  ],
  
  areaServed: {
    "@type": "Country",
    name: "Singapore",
  },
  
  priceRange: "$$",
  
  sameAs: [
    COMPANY_INFO.social.facebook,
    COMPANY_INFO.social.instagram,
    COMPANY_INFO.social.linkedin,
  ].filter(Boolean),
  
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "ACMV & Renovation Services",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Aircon Servicing",
          description: "Professional air conditioning maintenance and servicing",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Chemical Wash",
          description: "Deep chemical cleaning for air conditioning units",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Renovation Services",
          description: "Interior design and renovation for residential and commercial properties",
        },
      },
    ],
  },
});

export const getServiceSchema = (serviceName: string, description: string, price?: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: serviceName,
  provider: {
    "@type": "LocalBusiness",
    name: COMPANY_INFO.name,
    telephone: COMPANY_INFO.phone,
  },
  areaServed: {
    "@type": "Country",
    name: "Singapore",
  },
  description,
  ...(price && {
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "SGD",
    },
  }),
});

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: `${SEO_CONFIG.siteUrl}${item.url}`,
  })),
});
