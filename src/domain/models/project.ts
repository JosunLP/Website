import type { Localized } from './locale';

/** Broad category a project belongs to; used for grouping and filtering. */
export type ProjectCategory =
	'framework' | 'library' | 'tool' | 'template' | 'application';

/** Maintenance status shown on project cards. */
export type ProjectStatus = 'active' | 'maintained' | 'archived';

/**
 * A curated open-source project. Metadata is maintained locally on purpose:
 * the public site must not call the GitHub API at runtime (rate limits,
 * privacy, unstable SEO content).
 */
export interface Project {
	/** Stable slug, used for anchors and potential detail routes. */
	readonly slug: string;
	/** Display name (not localized — project names are proper nouns). */
	readonly name: string;
	readonly category: ProjectCategory;
	readonly status: ProjectStatus;
	/** Short, verified description per locale. */
	readonly description: Localized<string>;
	/** Technologies shown as tags. */
	readonly technologies: readonly string[];
	readonly repositoryUrl: string;
	/** Optional docs or live demo link. */
	readonly websiteUrl?: string;
	readonly license: string;
	/** Featured projects appear on the home page. */
	readonly featured: boolean;
	/**
	 * Flagship projects get the highlighted treatment
	 * (currently only bQuery.js).
	 */
	readonly flagship?: boolean;
}

const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
	'framework',
	'library',
	'tool',
	'template',
	'application',
];
const PROJECT_STATUSES: readonly ProjectStatus[] = [
	'active',
	'maintained',
	'archived',
];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates curated project data. Runs in unit tests and in the prerender
 * pipeline so broken data fails the build instead of shipping.
 */
export function validateProject(project: Project): string[] {
	const errors: string[] = [];
	if (!SLUG_PATTERN.test(project.slug)) {
		errors.push(`invalid slug: "${project.slug}"`);
	}
	if (project.name.trim() === '') {
		errors.push(`${project.slug}: empty name`);
	}
	if (!PROJECT_CATEGORIES.includes(project.category)) {
		errors.push(`${project.slug}: invalid category "${project.category}"`);
	}
	if (!PROJECT_STATUSES.includes(project.status)) {
		errors.push(`${project.slug}: invalid status "${project.status}"`);
	}
	for (const [locale, text] of Object.entries(project.description)) {
		if (text.trim() === '') {
			errors.push(`${project.slug}: empty ${locale} description`);
		}
	}
	if (project.technologies.length === 0) {
		errors.push(`${project.slug}: no technologies listed`);
	}
	for (const url of [project.repositoryUrl, project.websiteUrl]) {
		if (url !== undefined && !url.startsWith('https://')) {
			errors.push(`${project.slug}: non-https URL "${url}"`);
		}
	}
	return errors;
}
