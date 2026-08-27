import { pagePath } from '@/app/configuration';
import { PROJECTS, flagshipProject } from '@/content/projects';
import {
	absoluteUrl,
	pageGraphJsonLd,
	projectJsonLd,
} from '@/domain/services/seo';
import { formatMessage } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import { breadcrumbs, externalLink, projectCard, techTags } from '@/render/ui';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

export function renderProjectsPage(ctx: RenderContext): RenderedPage {
	const { messages, locale } = ctx;
	const flagship = flagshipProject();
	const rest = PROJECTS.filter((project) => project.flagship !== true);
	const meta = {
		locale,
		path: ctx.path,
		title: messages.projects.title,
		description: messages.projects.description,
	};

	const trail = [
		{ name: messages.nav.home, path: pagePath(locale, 'home') },
		{ name: messages.nav.projects, path: ctx.path },
	];

	const main = html`
		<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="text-4xl font-semibold tracking-tight">
				${messages.projects.heading}
			</h1>
			<p
				class="text-ink-muted dark:text-snow-muted mt-4 max-w-2xl text-lg leading-relaxed"
			>
				${messages.projects.intro}
			</p>

			${
				flagship !== undefined
					? html`<section
							class="rounded-card border-accent/40 bg-accent-soft/40 dark:border-accent-dark/40 dark:bg-accent-dark-soft/40 mt-12 border p-6 sm:p-8"
							aria-labelledby="flagship-heading"
						>
							<p
								class="jp-kicker text-accent dark:text-accent-dark mb-3 text-sm font-semibold tracking-widest uppercase"
								aria-hidden="true"
							>
								${messages.projects.flagshipHeading}
							</p>
							<div class="flex flex-wrap items-start justify-between gap-6">
								<div class="max-w-2xl space-y-4">
									<h2
										id="flagship-heading"
										class="text-2xl font-semibold tracking-tight"
									>
										${flagship.name}
									</h2>
									<p
										class="text-ink-muted dark:text-snow-muted leading-relaxed"
									>
										${flagship.description[locale]}
									</p>
									${techTags(
										flagship.technologies,
										messages.projects.technologiesLabel,
									)}
									<p class="flex flex-wrap gap-4 text-sm font-medium">
										${
											flagship.websiteUrl !== undefined
												? externalLink(
														flagship.websiteUrl,
														messages.projects.website,
														messages,
													)
												: null
										}
										${externalLink(
											flagship.repositoryUrl,
											messages.projects.repository,
											messages,
										)}
									</p>
								</div>
								<img
									src="/images/logo-bquery.svg"
									alt="${formatMessage(messages.projects.logoAlt, { name: flagship.name })}"
									width="96"
									height="96"
									loading="lazy"
									decoding="async"
									class="hidden h-24 w-24 shrink-0 sm:block"
								/>
							</div>
						</section>`
					: null
			}

			<div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				${rest.map((project) =>
					projectCard(project, locale, messages, { headingLevel: 'h2' }),
				)}
			</div>
		</div>
	`;

	// Flagship first, matching the visible order — `ItemList` positions are
	// a ranking signal, so they must agree with what the page shows.
	const ordered = flagship === undefined ? rest : [flagship, ...rest];
	const projectNodes = ordered.map((project) =>
		projectJsonLd({
			name: project.name,
			description: project.description[locale],
			repositoryUrl: project.repositoryUrl,
			...(project.websiteUrl !== undefined
				? { websiteUrl: project.websiteUrl }
				: {}),
			technologies: project.technologies,
			license: project.license,
		}),
	);
	const itemList = {
		'@type': 'ItemList',
		'@id': `${absoluteUrl(ctx.path)}#projects`,
		name: messages.projects.heading,
		numberOfItems: ordered.length,
		itemListOrder: 'https://schema.org/ItemListOrderAscending',
		itemListElement: projectNodes.map((node, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			item: { '@id': (node as { '@id': string })['@id'] },
		})),
	};

	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					pageType: 'CollectionPage',
					breadcrumb: trail,
					mainEntity: itemList['@id'],
					nodes: [itemList, ...projectNodes],
				}),
			],
		},
		main,
	};
}
