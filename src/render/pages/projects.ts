import { pagePath } from '@/app/configuration';
import { PROJECTS, flagshipProject } from '@/content/projects';
import {
	absoluteUrl,
	pageGraphJsonLd,
	projectJsonLd,
} from '@/domain/services/seo';
import { formatMessage } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import {
	breadcrumbs,
	externalLink,
	projectCard,
	ROW_LIST,
	techTags,
} from '@/render/ui';
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
		<div class="mx-auto max-w-5xl px-4 py-16 sm:px-6">
			${breadcrumbs(trail, messages)}
			<h1 class="jp-display max-w-2xl text-4xl sm:text-6xl">
				${messages.projects.heading}
			</h1>
			<p
				class="text-ink-muted dark:text-snow-muted mt-8 max-w-[52ch] text-lg leading-relaxed"
			>
				${messages.projects.intro}
			</p>

			${
				flagship !== undefined
					? html`<section
							class="border-accent dark:border-accent-dark mt-16 border-t-2 pt-8"
							aria-labelledby="flagship-heading"
						>
							<div class="grid gap-x-10 gap-y-6 md:grid-cols-12 md:items-start">
								<div class="md:col-span-4">
									<p
										class="jp-label text-accent dark:text-accent-dark"
										aria-hidden="true"
									>
										${messages.projects.flagshipHeading}
									</p>
									<h2 id="flagship-heading" class="jp-title mt-3 text-3xl">
										${flagship.name}
									</h2>
									<img
										src="/images/logo-bquery.svg"
										alt="${formatMessage(messages.projects.logoAlt, { name: flagship.name })}"
										width="64"
										height="64"
										loading="lazy"
										decoding="async"
										class="mt-6 hidden h-16 w-16 sm:block"
									/>
								</div>
								<div class="md:col-span-7 md:col-start-6">
									<p
										class="text-ink-muted dark:text-snow-muted leading-relaxed"
									>
										${flagship.description[locale]}
									</p>
									${techTags(
										flagship.technologies,
										messages.projects.technologiesLabel,
									)}
									<p class="jp-meta mt-5 flex flex-wrap gap-x-6 gap-y-1">
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
							</div>
						</section>`
					: null
			}

			<div class="${ROW_LIST} mt-20">
				${rest.map((project, index) =>
					projectCard(project, locale, messages, {
						headingLevel: 'h2',
						index,
					}),
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
