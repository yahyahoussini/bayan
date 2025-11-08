/**
 * Sitemap Generator
 * Generates sitemap.xml for all public pages
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://bayancosmetic.ma';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// Static pages
const staticPages = [
  { url: '', priority: 1.0, changefreq: 'daily' },
  { url: '/boutique', priority: 0.9, changefreq: 'daily' },
  { url: '/a-propos', priority: 0.7, changefreq: 'monthly' },
  { url: '/contact', priority: 0.8, changefreq: 'monthly' },
];

// Generate sitemap XML
function generateSitemap(products = []) {
  const now = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  // Add static pages
  staticPages.forEach(page => {
    xml += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  // Add product pages
  products.forEach(product => {
    if (product.slug && product.is_active) {
      xml += `  <url>
    <loc>${BASE_URL}/produit/${product.slug}</loc>
    <lastmod>${product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }
  });

  xml += `</urlset>`;

  return xml;
}

// Write sitemap to file
function writeSitemap(xml) {
  try {
    // Ensure public directory exists
    const publicDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
    console.log(`✅ Sitemap generated successfully at ${OUTPUT_PATH}`);
    console.log(`   Total URLs: ${(staticPages.length + (xml.match(/<url>/g) || []).length - staticPages.length)}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

// Generate basic sitemap (for build time)
const basicSitemap = generateSitemap();
writeSitemap(basicSitemap);

// Export for use in build scripts
module.exports = { generateSitemap, writeSitemap };



