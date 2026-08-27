import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	BLOG_MANIFEST_VERSION,
	validateManifest,
	type BlogManifest,
} from '@/domain/models/blog';
import {
	CONTENT_BLOG_DIR,
	loadAllPosts,
	toManifestEntries,
} from './lib/blog-files';

/**
 * Generates `content/blog/index.json` from the local Markdown files.
 * Run after adding or editing posts; upload the result together with the
 * Markdown files (see docs/blog-content-workflow.md).
 */
const target = join(CONTENT_BLOG_DIR, 'index.json');
const posts = loadAllPosts();
const entries = toManifestEntries(posts);

/**
 * `generatedAt` records when the listing last changed, not when this
 * script last ran. A fresh timestamp on every build would rewrite the
 * committed manifest on every `bun run build`, leaving the working tree
 * dirty and re-uploading an otherwise identical file on every deploy.
 */
function timestampFor(entries: BlogManifest['posts']): string {
	const now = new Date().toISOString();
	if (!existsSync(target)) {
		return now;
	}
	let previous: unknown;
	try {
		previous = JSON.parse(readFileSync(target, 'utf8'));
	} catch {
		return now; // Unreadable or malformed: stamp a fresh one.
	}
	if (validateManifest(previous).length > 0) {
		return now;
	}
	const { generatedAt, posts } = previous as Record<string, unknown>;
	return typeof generatedAt === 'string' &&
		JSON.stringify(posts) === JSON.stringify(entries)
		? generatedAt
		: now;
}

const manifest: BlogManifest = {
	version: BLOG_MANIFEST_VERSION,
	generatedAt: timestampFor(entries),
	posts: entries,
};

const errors = validateManifest(manifest);
if (errors.length > 0) {
	console.error('Generated manifest failed validation:');
	for (const error of errors) {
		console.error(`  - ${error}`);
	}
	process.exit(1);
}

writeFileSync(target, `${JSON.stringify(manifest, null, '\t')}\n`);
console.log(
	`content/blog/index.json written (${String(manifest.posts.length)} posts).`,
);
