import { OWNER, pagePath } from '@/app/configuration';
import type { BlogManifestEntry } from '@/domain/models/blog';
import { ENTITY_ID, pageGraphJsonLd } from '@/domain/services/seo';
import { FOCUS_AREAS, expertiseTopics } from '@/content/skills';
import {
	PROJECTS,
	featuredProjects,
	flagshipProject,
	technologyCount,
} from '@/content/projects';
import { formatMessage } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import {
	arrowLink,
	blogCard,
	buttonLink,
	externalLink,
	projectCard,
	ROW_LIST,
	sectionHeading,
	techTags,
} from '@/render/ui';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

export function renderHomePage(
	ctx: RenderContext,
	latestPosts: readonly BlogManifestEntry[],
): RenderedPage {
	const { messages, locale } = ctx;
	const flagship = flagshipProject();
	const projects = featuredProjects().filter(
		(project) => project.flagship !== true,
	);

	const main = html`
		<div class="mx-auto max-w-5xl px-4 sm:px-6">
			<!--
				Hero. No stat cards, no floating artwork: a name, a claim, and
				two ways forward. The counts still appear, but as one line of
				metadata under a rule — they are context, not the headline.
			-->
			<section class="py-20 sm:py-32" aria-labelledby="hero-heading">
				<p class="jp-meta text-ink-muted dark:text-snow-muted">
					${messages.siteTagline}
				</p>
				<h1
					id="hero-heading"
					class="jp-display mt-8 max-w-3xl text-5xl sm:text-7xl"
				>
					${messages.home.heroHeading}
				</h1>
				<p
					class="text-ink-muted dark:text-snow-muted mt-8 max-w-[52ch] text-lg leading-relaxed"
				>
					${messages.home.heroIntro}
				</p>
				<p class="mt-10 flex flex-wrap gap-3">
					${buttonLink(
						pagePath(locale, 'projects'),
						messages.home.ctaProjects,
						'primary',
					)}
					${buttonLink(
						pagePath(locale, 'contact'),
						messages.home.ctaContact,
						'secondary',
					)}
				</p>
				<dl
					class="jp-meta border-line dark:border-night-line text-ink-muted dark:text-snow-muted mt-16 flex flex-wrap gap-x-8 gap-y-2 border-t pt-5"
				>
					${[
						{ value: PROJECTS.length, label: messages.home.statsProjects },
						{ value: technologyCount(), label: messages.home.statsTech },
						{ value: latestPosts.length, label: messages.home.statsPosts },
					].map(
						(stat) =>
							// Row-reverse so the figure reads first visually while the
							// DOM keeps the term-before-definition order a <dl> requires.
							html`<div class="flex flex-row-reverse items-baseline gap-2">
								<dt>${formatMessage(stat.label, { count: stat.value })}</dt>
								<dd class="text-ink dark:text-snow">${stat.value}</dd>
							</div>`,
					)}
				</dl>
			</section>

			<!-- Selected work -->
			<section class="pb-24" aria-labelledby="selected-work">
				${sectionHeading(
					0,
					'selected-work',
					'Open Source',
					messages.home.selectedWorkHeading,
					messages.home.selectedWorkIntro,
				)}
				${
					flagship !== undefined
						? html`<div
								class="border-accent dark:border-accent-dark border-t-2 pt-8 pb-10"
							>
								<div
									class="grid gap-x-10 gap-y-6 md:grid-cols-12 md:items-start"
								>
									<div class="md:col-span-4">
										<p class="jp-label text-accent dark:text-accent-dark">
											${messages.projects.flagshipHeading}
										</p>
										<h3 class="jp-title mt-3 text-3xl">${flagship.name}</h3>
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
							</div>`
						: null
				}
				<div class="${ROW_LIST}">
					${projects.map((project, index) =>
						projectCard(project, locale, messages, { index }),
					)}
				</div>
				<p class="mt-10">
					${arrowLink(pagePath(locale, 'projects'), messages.home.allProjects)}
				</p>
			</section>

			<!-- About snapshot -->
			<section class="pb-24" aria-labelledby="about-snapshot">
				${sectionHeading(
					1,
					'about-snapshot',
					messages.nav.about,
					messages.home.aboutHeading,
				)}
				<p
					class="text-ink-muted dark:text-snow-muted max-w-[60ch] text-lg leading-relaxed"
				>
					${messages.home.aboutText}
				</p>
				<p class="mt-8">
					${arrowLink(pagePath(locale, 'about'), messages.home.aboutMore)}
				</p>
			</section>

			<!-- Technical focus -->
			<section class="pb-24" aria-labelledby="technical-focus">
				${sectionHeading(
					2,
					'technical-focus',
					messages.projects.technologiesLabel,
					messages.home.focusHeading,
					messages.home.focusIntro,
				)}
				<div class="${ROW_LIST}">
					${FOCUS_AREAS.map(
						(area, index) =>
							html`<article
								class="border-line dark:border-night-line border-t px-4 py-8 sm:px-6"
							>
								<div class="grid gap-x-10 gap-y-3 md:grid-cols-12">
									<div class="md:col-span-4">
										<p
											class="jp-label text-ink-muted dark:text-snow-muted"
											aria-hidden="true"
										>
											${String(index + 1).padStart(2, '0')}
										</p>
										<h3 class="jp-title mt-3 text-xl">
											${area.heading[locale]}
										</h3>
									</div>
									<div class="md:col-span-7 md:col-start-6">
										<p
											class="text-ink-muted dark:text-snow-muted leading-relaxed"
										>
											${area.text[locale]}
										</p>
										${techTags(
											area.keywords,
											messages.projects.technologiesLabel,
										)}
									</div>
								</div>
							</article>`,
					)}
				</div>
			</section>

			<!-- Latest writing -->
			<section class="pb-24" aria-labelledby="latest-writing">
				${sectionHeading(
					3,
					'latest-writing',
					messages.nav.blog,
					messages.home.writingHeading,
					messages.home.writingIntro,
				)}
				${
					latestPosts.length > 0
						? html`<div class="${ROW_LIST}">
								${latestPosts
									.slice(0, 3)
									.map((post) => blogCard(post, locale, messages))}
							</div>`
						: html`<p class="text-ink-muted dark:text-snow-muted">
								${messages.blog.empty}
							</p>`
				}
				<p class="mt-10">
					${arrowLink(pagePath(locale, 'blog'), messages.home.allPosts)}
				</p>
			</section>

			<!-- Contact -->
			<section class="pb-24" aria-labelledby="contact-cta">
				${sectionHeading(
					4,
					'contact-cta',
					messages.nav.contact,
					messages.home.contactHeading,
				)}
				<p
					class="text-ink-muted dark:text-snow-muted max-w-[60ch] text-lg leading-relaxed"
				>
					${messages.home.contactText}
				</p>
				<p class="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
					${buttonLink(`mailto:${OWNER.email}`, OWNER.email, 'primary')}
					<span class="jp-meta"
						>${externalLink(OWNER.gitHubUrl, 'GitHub', ctx.messages)}</span
					>
				</p>
			</section>
		</div>
	`;

	const meta = {
		locale,
		path: ctx.path,
		title: messages.home.title,
		description: messages.home.description,
	};
	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					// The home page is the site's canonical description of the
					// person; every other page's Person node points back at it.
					pageType: 'ProfilePage',
					mainEntity: ENTITY_ID.person,
					about: ENTITY_ID.person,
					personDescription: messages.home.description,
					knowsAbout: expertiseTopics(),
					breadcrumb: [
						{ name: messages.nav.home, path: pagePath(locale, 'home') },
					],
				}),
			],
		},
		main,
	};
}
