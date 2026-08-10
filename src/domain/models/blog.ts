import { isLocale, type Locale } from './locale';

/** Front matter of a Markdown blog post (the authoring contract). */
export interface BlogFrontMatter {
	readonly title: string;
	readonly description: string;
	/** ISO date, e.g. "2026-07-09". */
	readonly publishedAt: string;
	readonly updatedAt?: string;
	readonly slug: string;
	readonly locale: Locale;
	/** Groups translations of the same article across locales. */
	readonly translationKey: string;
	readonly tags: readonly string[];
	readonly draft: boolean;
	readonly featured: boolean;
	readonly coverImage?: string;
	readonly coverImageAlt?: string;
	readonly canonicalUrl?: string;
}

/** A parsed post: validated front matter plus the raw Markdown body. */
export interface BlogPost {
	readonly meta: BlogFrontMatter;
	readonly markdown: string;
}

/** One entry of the public blog manifest (`/content/blog/index.json`). */
export interface BlogManifestEntry {
	readonly title: string;
	readonly description: string;
	readonly publishedAt: string;
	readonly updatedAt?: string;
	readonly slug: string;
	readonly locale: Locale;
	readonly translationKey: string;
	readonly tags: readonly string[];
	readonly featured: boolean;
	readonly coverImage?: string;
	readonly coverImageAlt?: string;
	/** Path of the Markdown file relative to the site origin. */
	readonly path: string;
	/**
	 * Estimated reading time in minutes, computed from the Markdown body
	 * at manifest-generation time. Optional so manifests written before
	 * this field existed still validate.
	 */
	readonly readingMinutes?: number;
}

/** The public blog manifest. `version` guards the client against drift. */
export interface BlogManifest {
	readonly version: 1;
	readonly generatedAt: string;
	readonly posts: readonly BlogManifestEntry[];
}

export const BLOG_MANIFEST_VERSION = 1;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isStringArray(value: unknown): value is string[] {
	return (
		Array.isArray(value) && value.every((item) => typeof item === 'string')
	);
}

/**
 * Validates unknown data as front matter. Returns a list of problems;
 * an empty list means the value is a valid {@link BlogFrontMatter}.
 */
export function validateFrontMatter(value: unknown): string[] {
	const errors: string[] = [];
	if (typeof value !== 'object' || value === null) {
		return ['front matter is not an object'];
	}
	const data = value as Record<string, unknown>;
	for (const key of [
		'title',
		'description',
		'publishedAt',
		'slug',
		'locale',
		'translationKey',
	]) {
		const field = data[key];
		if (typeof field !== 'string' || field.trim() === '') {
			errors.push(`"${key}" must be a non-empty string`);
		}
	}
	if (
		typeof data.publishedAt === 'string' &&
		!ISO_DATE.test(data.publishedAt)
	) {
		errors.push('"publishedAt" must be an ISO date (YYYY-MM-DD)');
	}
	if (
		data.updatedAt !== undefined &&
		(typeof data.updatedAt !== 'string' || !ISO_DATE.test(data.updatedAt))
	) {
		errors.push('"updatedAt" must be an ISO date (YYYY-MM-DD)');
	}
	if (typeof data.slug === 'string' && !SLUG_PATTERN.test(data.slug)) {
		errors.push(`"slug" must be kebab-case, got "${data.slug}"`);
	}
	if (typeof data.locale === 'string' && !isLocale(data.locale)) {
		errors.push(`"locale" must be one of the supported locales`);
	}
	if (data.tags !== undefined && !isStringArray(data.tags)) {
		errors.push('"tags" must be a list of strings');
	}
	for (const key of ['draft', 'featured'] as const) {
		if (data[key] !== undefined && typeof data[key] !== 'boolean') {
			errors.push(`"${key}" must be a boolean`);
		}
	}
	if (
		typeof data.coverImage === 'string' &&
		data.coverImage !== '' &&
		(typeof data.coverImageAlt !== 'string' || data.coverImageAlt.trim() === '')
	) {
		errors.push('"coverImageAlt" is required when "coverImage" is set');
	}
	return errors;
}

/** Parses and normalizes validated front-matter data. */
export function toFrontMatter(value: Record<string, unknown>): BlogFrontMatter {
	const errors = validateFrontMatter(value);
	if (errors.length > 0) {
		throw new Error(`invalid front matter: ${errors.join('; ')}`);
	}
	const coverImage =
		typeof value.coverImage === 'string' && value.coverImage !== ''
			? value.coverImage
			: undefined;
	return {
		title: value.title as string,
		description: value.description as string,
		publishedAt: value.publishedAt as string,
		...(typeof value.updatedAt === 'string'
			? { updatedAt: value.updatedAt }
			: {}),
		slug: value.slug as string,
		locale: value.locale as Locale,
		translationKey: value.translationKey as string,
		tags: isStringArrayOrEmpty(value.tags),
		draft: value.draft === true,
		featured: value.featured === true,
		...(coverImage !== undefined ? { coverImage } : {}),
		...(coverImage !== undefined && typeof value.coverImageAlt === 'string'
			? { coverImageAlt: value.coverImageAlt }
			: {}),
		...(typeof value.canonicalUrl === 'string' && value.canonicalUrl !== ''
			? { canonicalUrl: value.canonicalUrl }
			: {}),
	};
}

function isStringArrayOrEmpty(value: unknown): readonly string[] {
	return isStringArray(value) ? value : [];
}

/**
 * Validates unknown JSON as a {@link BlogManifest}. Used by the runtime
 * client, the generator, and tests.
 */
export function validateManifest(value: unknown): string[] {
	const errors: string[] = [];
	if (typeof value !== 'object' || value === null) {
		return ['manifest is not an object'];
	}
	const data = value as Record<string, unknown>;
	if (data.version !== BLOG_MANIFEST_VERSION) {
		errors.push(`unsupported manifest version: ${String(data.version)}`);
	}
	if (!Array.isArray(data.posts)) {
		errors.push('"posts" must be an array');
		return errors;
	}
	data.posts.forEach((post: unknown, index: number) => {
		if (typeof post !== 'object' || post === null) {
			errors.push(`post ${String(index)} is not an object`);
			return;
		}
		const entry = post as Record<string, unknown>;
		for (const key of [
			'title',
			'description',
			'publishedAt',
			'slug',
			'locale',
			'translationKey',
			'path',
		]) {
			if (typeof entry[key] !== 'string' || entry[key] === '') {
				errors.push(
					`post ${String(index)}: "${key}" must be a non-empty string`,
				);
			}
		}
		if (typeof entry.locale === 'string' && !isLocale(entry.locale)) {
			errors.push(`post ${String(index)}: unsupported locale`);
		}
		if (entry.tags !== undefined && !isStringArray(entry.tags)) {
			errors.push(`post ${String(index)}: "tags" must be a list of strings`);
		}
		if (
			entry.readingMinutes !== undefined &&
			(typeof entry.readingMinutes !== 'number' ||
				!Number.isInteger(entry.readingMinutes) ||
				entry.readingMinutes < 1)
		) {
			errors.push(
				`post ${String(index)}: "readingMinutes" must be a positive integer`,
			);
		}
		if (
			typeof entry.path === 'string' &&
			!/^\/content\/blog\/[a-z]{2}\/[a-z0-9-]+\.md$/.test(entry.path)
		) {
			errors.push(`post ${String(index)}: unexpected path "${entry.path}"`);
		}
	});
	return errors;
}
