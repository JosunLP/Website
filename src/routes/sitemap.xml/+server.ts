interface SitemapUrl {
	loc: string;
	lastmod: string;
	changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
	priority: number;
	images?: Array<{
		loc: string;
		title?: string;
		caption?: string;
	}>;
}

const currentDate = new Date();
const year = currentDate.getFullYear();
const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
const day = currentDate.getDate().toString().padStart(2, '0');
const formattedDate = `${year}-${month}-${day}`;

const baseUrl = 'https://josunlp.de';

// Define all URLs with their metadata
const urls: SitemapUrl[] = [
	{
		loc: `${baseUrl}/`,
		lastmod: formattedDate,
		changefreq: 'weekly',
		priority: 1.0,
		images: [
			{
				loc: `${baseUrl}/images/lang.png`,
				title: 'JosunLP Logo',
				caption: 'Professional logo of Jonas Pfalzgraf'
			}
		]
	},
	{
		loc: `${baseUrl}/#home`,
		lastmod: formattedDate,
		changefreq: 'weekly',
		priority: 0.9
	},
	{
		loc: `${baseUrl}/#about`,
		lastmod: formattedDate,
		changefreq: 'monthly',
		priority: 0.8
	},
	{
		loc: `${baseUrl}/#contact`,
		lastmod: formattedDate,
		changefreq: 'monthly',
		priority: 0.7
	},
	{
		loc: `${baseUrl}/imprint`,
		lastmod: formattedDate,
		changefreq: 'yearly',
		priority: 0.3
	},
	{
		loc: `${baseUrl}/datasecurity`,
		lastmod: formattedDate,
		changefreq: 'yearly',
		priority: 0.3
	}
];

export async function GET() {
	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
	xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
	xmlns:xhtml="https://www.w3.org/1999/xhtml"
>
${urls
	.map(
		(url) => `	<url>
		<loc>${url.loc}</loc>
		<lastmod>${url.lastmod}</lastmod>
		<changefreq>${url.changefreq}</changefreq>
		<priority>${url.priority}</priority>
${
	url.images
		? url.images
				.map(
					(image) => `		<image:image>
			<image:loc>${image.loc}</image:loc>
			${image.title ? `<image:title>${image.title}</image:title>` : ''}
			${image.caption ? `<image:caption>${image.caption}</image:caption>` : ''}
		</image:image>`
				)
				.join('\n')
		: ''
}
	</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(sitemap.trim(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
		}
	});
}
