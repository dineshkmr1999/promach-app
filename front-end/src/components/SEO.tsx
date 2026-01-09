import { Helmet } from "react-helmet-async";
import { SEO_CONFIG, COMPANY_INFO, getLocalBusinessSchema } from "@/constants";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: readonly string[] | string[];
  canonical?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  structuredData?: object | object[];
  breadcrumbs?: { name: string; url: string }[];
}

/**
 * SEO Component for managing meta tags, Open Graph, Twitter Cards, and Structured Data
 * Optimized for Singapore market and digital marketing
 */
export const SEO = ({
  title,
  description = SEO_CONFIG.defaultDescription,
  keywords = SEO_CONFIG.defaultKeywords,
  canonical,
  noIndex = false,
  ogImage = SEO_CONFIG.og.image,
  ogType = "website",
  structuredData,
  breadcrumbs,
}: SEOProps) => {
  const fullTitle = title
    ? SEO_CONFIG.titleTemplate.replace("%s", title)
    : SEO_CONFIG.defaultTitle;

  const canonicalUrl = canonical
    ? `${SEO_CONFIG.siteUrl}${canonical}`
    : undefined;

  // Combine default structured data with page-specific
  const allStructuredData = [
    getLocalBusinessSchema(),
    ...(Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : []),
    ...(breadcrumbs
      ? [
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: breadcrumbs.map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: item.name,
              item: `${SEO_CONFIG.siteUrl}${item.url}`,
            })),
          },
        ]
      : []),
  ];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
      
      {/* Robots */}
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Geo Tags for Singapore targeting */}
      <meta name="geo.region" content={SEO_CONFIG.geo.region} />
      <meta name="geo.placename" content={SEO_CONFIG.geo.placename} />
      <meta name="geo.position" content={SEO_CONFIG.geo.position} />
      <meta name="ICBM" content={SEO_CONFIG.geo.position.replace(";", ", ")} />
      
      {/* Language & Locale */}
      <meta httpEquiv="content-language" content="en-SG" />
      <meta name="language" content="English" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl || SEO_CONFIG.siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${SEO_CONFIG.siteUrl}${ogImage}`} />
      <meta property="og:image:width" content={SEO_CONFIG.og.imageWidth.toString()} />
      <meta property="og:image:height" content={SEO_CONFIG.og.imageHeight.toString()} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />
      <meta property="og:locale" content={SEO_CONFIG.og.locale} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={SEO_CONFIG.twitter.card} />
      <meta name="twitter:url" content={canonicalUrl || SEO_CONFIG.siteUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SEO_CONFIG.siteUrl}${ogImage}`} />
      {SEO_CONFIG.twitter.site && (
        <meta name="twitter:site" content={SEO_CONFIG.twitter.site} />
      )}
      
      {/* Business Contact Info for Rich Results */}
      <meta name="author" content={COMPANY_INFO.name} />
      <meta name="publisher" content={COMPANY_INFO.name} />
      
      {/* Mobile & PWA */}
      <meta name="format-detection" content="telephone=yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={COMPANY_INFO.shortName} />
      
      {/* Structured Data (JSON-LD) */}
      {allStructuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
