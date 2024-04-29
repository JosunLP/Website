const currentDate = new Date();

const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

export async function GET() {
	return new Response(
		/*XML*/ `
		<?xml version="1.0" encoding="UTF-8" ?>
		<urlset
			xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
			xmlns:xhtml="https://www.w3.org/1999/xhtml"
			xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
			xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
			xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
			xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
		>
			<url>
				<loc>https://josunlp.de/</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>1.0</priority>
   		</url>

			<url>
				<loc>https://josunlp.de/#home</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>1.0</priority>
   		</url>

			<url>
				<loc>https://josunlp.de/#home</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>0.5</priority>
   		</url>

			<url>
				<loc>https://josunlp.de/#about</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>0.5</priority>
   		</url>

			<url>
				<loc>https://josunlp.de/#contact</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>0.5</priority>
   		</url>

			<url>
				<loc>https://josunlp.de/imprint</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>0.8</priority>
			</url>

			<url>
				<loc>https://josunlp.de/datasecurity</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>0.8</priority>
			</url>

			<url>
				<loc>https://josunlp.de/cookiepolicy</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>0.8</priority>
			</url>

			<url>
				<loc>https://josunlp.de/privacy</loc>
				<lastmod>${formattedDate}</lastmod>
				<changefreq>monthly</changefreq>
				<priority>0.8</priority>
			</url>

		</urlset>`.trim(),
		{
			headers: {
				'Content-Type': 'application/xml'
			}
		}
	);
}
