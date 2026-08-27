import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { LOCALES } from '@/domain/models/locale';
import { feedPath, renderAtomFeed } from '@/domain/services/feed';
import { messagesFor } from '@/features/i18n';
import { loadAllPosts, toManifestEntries } from './lib/blog-files';

/**
 * Generates one Atom feed per locale under `public/`, alongside
 * `blog-sitemap.xml`.
 *
 * Deliberately a generator rather than a prerender route: a post can be
 * published by uploading files to a running server without a rebuild
 * (see docs/blog-content-workflow.md), and a feed that only existed as
 * build output would silently go stale on exactly that path. Being a
 * plain file in `public/` means it is regenerated and uploaded the same
 * way the manifest and the blog sitemap are.
 */
const entries = toManifestEntries(loadAllPosts());
const PUBLIC = join(process.cwd(), 'public');

for (const locale of LOCALES) {
	const messages = messagesFor(locale);
	const xml = renderAtomFeed({
		locale,
		title: messages.blog.feedTitle,
		subtitle: messages.blog.intro,
		posts: entries.filter((entry) => entry.locale === locale),
	});
	const target = join(PUBLIC, feedPath(locale).slice(1));
	mkdirSync(dirname(target), { recursive: true });
	writeFileSync(target, xml);
}

console.log(
	`public/{${LOCALES.join(',')}}/blog/feed.xml written (${String(entries.length)} entries).`,
);
