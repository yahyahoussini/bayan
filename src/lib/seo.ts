/**
 * SEO Utility Functions
 * Provides utilities for generating SEO metadata and structured data
 */

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  nofollow?: boolean;
}

export interface ProductSEOData extends SEOData {
  price?: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
}

const BASE_URL = 'https://bayancosmetic.ma';
const DEFAULT_IMAGE = `${BASE_URL}/assets/logo.png`;
const DEFAULT_DESCRIPTION = 'Produits de beauté naturels marocains - Bayan Cosmetic offre une gamme complète de soins naturels pour votre peau, vos cheveux et votre corps.';
const DEFAULT_KEYWORDS = 'produits beauté naturels, cosmétiques marocains, soins naturels, huile argan, luban dakar, beauté bio, cosmétiques bio maroc';

/**
 * Generate full page title
 */
export function generateTitle(pageTitle: string, siteName: string = 'Bayan Cosmetic'): string {
  if (pageTitle === siteName) {
    return pageTitle;
  }
  return `${pageTitle} | ${siteName}`;
}

/**
 * Generate canonical URL
 */
export function generateCanonical(path: string = ''): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOGImage(image?: string, fallback: string = DEFAULT_IMAGE): string {
  if (!image) return fallback;
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return `${BASE_URL}${image}`;
  return `${BASE_URL}/${image}`;
}

/**
 * Generate Product structured data (JSON-LD)
 */
export function generateProductStructuredData(data: {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  currency?: string;
  availability?: 'in stock' | 'out of stock' | 'preorder';
  brand?: string;
  category?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  url: string;
}): object {
  const images = Array.isArray(data.image) ? data.image : [data.image];
  const fullImages = images.map(img => generateOGImage(img));

  const structuredData: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: fullImages,
    brand: {
      '@type': 'Brand',
      name: data.brand || 'Bayan Cosmetic'
    },
    offers: {
      '@type': 'Offer',
      url: data.url,
      priceCurrency: data.currency || 'MAD',
      price: data.price,
      availability: `https://schema.org/${data.availability === 'in stock' ? 'InStock' : data.availability === 'out of stock' ? 'OutOfStock' : 'PreOrder'}`,
      seller: {
        '@type': 'Organization',
        name: 'Bayan Cosmetic'
      }
    }
  };

  if (data.sku) {
    structuredData.sku = data.sku;
  }

  if (data.category) {
    structuredData.category = data.category;
  }

  if (data.rating && data.reviewCount) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      reviewCount: data.reviewCount
    };
  }

  return structuredData;
}

/**
 * Generate Organization structured data (JSON-LD)
 */
export function generateOrganizationStructuredData(data?: {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  contactPoint?: {
    telephone?: string;
    contactType?: string;
    areaServed?: string;
  };
  sameAs?: string[];
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data?.name || 'Bayan Cosmetic',
    url: data?.url || BASE_URL,
    logo: data?.logo || generateOGImage(),
    description: data?.description || DEFAULT_DESCRIPTION,
    ...(data?.contactPoint && {
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: data.contactPoint.telephone,
        contactType: data.contactPoint.contactType || 'customer service',
        areaServed: data.contactPoint.areaServed || 'MA'
      }
    }),
    ...(data?.sameAs && { sameAs: data.sameAs })
  };
}

/**
 * Generate BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: generateCanonical(item.url)
    }))
  };
}

/**
 * Generate WebSite structured data (JSON-LD)
 */
export function generateWebSiteStructuredData(data?: {
  name?: string;
  url?: string;
  potentialAction?: {
    target: string;
    queryInput: string;
  };
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data?.name || 'Bayan Cosmetic',
    url: data?.url || BASE_URL,
    ...(data?.potentialAction && {
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: data.potentialAction.target
        },
        'query-input': data.potentialAction.queryInput
      }
    })
  };
}

/**
 * Generate FAQ structured data (JSON-LD)
 */
export function generateFAQStructuredData(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

export { BASE_URL, DEFAULT_IMAGE, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS };



