import { provinces } from '@/data/provinces'

const SITE_URL = 'https://www.havadurumu15.com'

function generateSiteMap() {
  const now = new Date().toISOString()

  const staticUrls = [
    {
      loc: `${SITE_URL}/`,
      changefreq: 'hourly',
      priority: '1.0'
    }
  ]

  const cityUrls = provinces.map((city) => ({
    loc: `${SITE_URL}/hava/${city.slug}`,
    changefreq: 'hourly',
    priority: '0.8'
  }))

  const allUrls = [...staticUrls, ...cityUrls]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`
}

export async function getServerSideProps({ res }) {
  const sitemap = generateSiteMap()

  res.setHeader('Content-Type', 'text/xml')
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
  res.write(sitemap)
  res.end()

  return {
    props: {}
  }
}

export default function SiteMap() {
  return null
}
