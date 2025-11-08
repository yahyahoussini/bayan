/**
 * Custom hook for managing SEO meta tags
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import type { SEOData, ProductSEOData } from '@/lib/seo';
import { generateCanonical, generateOGImage, BASE_URL } from '@/lib/seo';

interface UseSEOOptions extends SEOData {
  structuredData?: object | object[];
  breadcrumbs?: Array<{ name: string; url: string }>;
}

export function useSEO(options: UseSEOOptions) {
  const location = useLocation();
  const canonical = options.url || generateCanonical(location.pathname);
  const ogImage = generateOGImage(options.image);
  const fullTitle = options.title.includes('Bayan Cosmetic') 
    ? options.title 
    : `${options.title} | Bayan Cosmetic`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;
  }, [fullTitle]);

  return {
    HelmetSEO: () => (
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={options.description} />
        {options.keywords && <meta name="keywords" content={options.keywords} />}
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonical} />
        
        {/* Robots */}
        {(options.noindex || options.nofollow) && (
          <meta 
            name="robots" 
            content={`${options.noindex ? 'noindex' : 'index'}, ${options.nofollow ? 'nofollow' : 'follow'}`} 
          />
        )}
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={options.description} />
        <meta property="og:type" content={options.type || 'website'} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:site_name" content="Bayan Cosmetic" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={options.description} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* Structured Data */}
        {options.structuredData && (
          Array.isArray(options.structuredData) 
            ? options.structuredData.map((data, index) => (
                <script
                  key={index}
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
                />
              ))
            : (
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(options.structuredData) }}
              />
            )
        )}
      </Helmet>
    ),
    canonical,
    ogImage,
    fullTitle
  };
}

export function useProductSEO(product: ProductSEOData & { structuredData?: object | object[] }) {
  return useSEO({
    ...product,
    type: 'product',
    structuredData: product.structuredData
  });
}



