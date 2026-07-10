import { describe, expect, it } from 'vitest';
import {
	PROJECTS,
	featuredProjects,
	flagshipProject,
} from '@/content/projects';
import { validateProject } from '@/domain/models/project';

const REQUIRED_SLUGS = [
	'bquery',
	'threadts-universal',
	'sort-it-now',
	'userscript-project-template',
	'browser-extension-template',
	'checkai',
	'planning-poker',
	'retro-rumble',
];

describe('project catalog', () => {
	it('contains all required featured projects', () => {
		const slugs = PROJECTS.map((project) => project.slug);
		for (const slug of REQUIRED_SLUGS) {
			expect(slugs).toContain(slug);
		}
	});

	it('every project passes validation', () => {
		for (const project of PROJECTS) {
			expect(validateProject(project)).toEqual([]);
		}
	});

	it('has unique slugs', () => {
		const slugs = PROJECTS.map((project) => project.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('bQuery.js is the single flagship project', () => {
		expect(flagshipProject()?.slug).toBe('bquery');
		expect(
			PROJECTS.filter((project) => project.flagship === true),
		).toHaveLength(1);
	});

	it('featured projects include the flagship', () => {
		expect(
			featuredProjects().some((project) => project.slug === 'bquery'),
		).toBe(true);
	});

	it('descriptions differ between locales', () => {
		for (const project of PROJECTS) {
			expect(project.description.de).not.toBe(project.description.en);
		}
	});
});

describe('validateProject', () => {
	it('flags broken data', () => {
		const errors = validateProject({
			slug: 'Bad Slug',
			name: ' ',
			category: 'framework',
			status: 'active',
			description: { de: '', en: 'x' },
			technologies: [],
			repositoryUrl: 'http://insecure.example',
			license: 'MIT',
			featured: false,
		});
		expect(errors.length).toBeGreaterThanOrEqual(4);
	});
});
