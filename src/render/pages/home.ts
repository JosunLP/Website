import { OWNER, pagePath } from '@/app/configuration';
import type { BlogManifestEntry } from '@/domain/models/blog';
import {
	breadcrumbJsonLd,
	personJsonLd,
	webSiteJsonLd,
} from '@/domain/services/seo';
import { FOCUS_AREAS } from '@/content/skills';
import { featuredProjects, flagshipProject } from '@/content/projects';
import { formatMessage } from '@/features/i18n';
import type { RenderContext } from '@/render/layout';
import {
	blogCard,
	buttonLink,
	externalLink,
	motif,
	projectCard,
	sectionHeading,
	techTags,
} from '@/render/ui';
import { html, raw } from '@/utils/html';
import type { RenderedPage } from './types';

/** Decorative hero artwork: a larger instance of the module motif. */
function heroArt(): ReturnType<typeof motif> {
	return motif(
		7,
		'pointer-events-none absolute -top-6 right-0 hidden h-40 w-80 text-accent/50 dark:text-accent-dark/40 lg:block',
	);
}

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
		<div class="mx-auto max-w-6xl px-4 sm:px-6">
			<!-- Hero -->
			<section class="relative py-14 sm:py-28" aria-labelledby="hero-heading">
				${heroArt()}
				<h1
					id="hero-heading"
					class="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
				>
					${messages.home.heroHeading}
				</h1>
				<p
					class="text-ink-muted dark:text-snow-muted mt-6 max-w-2xl text-lg leading-relaxed"
				>
					${messages.home.heroIntro}
				</p>
				<p class="mt-8 flex flex-wrap gap-3">
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
			</section>

			<!-- Selected work -->
			<section class="py-16" aria-labelledby="selected-work">
				${sectionHeading(
					'selected-work',
					'Open Source',
					messages.home.selectedWorkHeading,
				)}
				<p class="text-ink-muted dark:text-snow-muted -mt-6 mb-10 max-w-2xl">
					${messages.home.selectedWorkIntro}
				</p>
				${
					flagship !== undefined
						? html`<div
								class="rounded-card border-accent/40 bg-accent-soft/40 dark:border-accent-dark/40 dark:bg-accent-dark-soft/40 mb-8 border p-6 sm:p-8"
							>
								<p
									class="text-accent dark:text-accent-dark mb-3 text-sm font-semibold tracking-widest uppercase"
								>
									${messages.projects.flagshipHeading}
								</p>
								<div class="flex flex-wrap items-start justify-between gap-6">
									<div class="max-w-2xl space-y-4">
										<h3 class="text-2xl font-semibold tracking-tight">
											${flagship.name}
										</h3>
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
										class="hidden h-24 w-24 shrink-0 sm:block"
									/>
								</div>
							</div>`
						: null
				}
				<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					${projects.map((project) => projectCard(project, locale, messages))}
				</div>
				<p class="mt-8">
					${buttonLink(
						pagePath(locale, 'projects'),
						messages.home.allProjects,
						'secondary',
					)}
				</p>
			</section>

			<!-- About snapshot -->
			<section class="py-16" aria-labelledby="about-snapshot">
				${sectionHeading('about-snapshot', messages.nav.about, messages.home.aboutHeading)}
				<p
					class="text-ink-muted dark:text-snow-muted -mt-4 max-w-2xl leading-relaxed"
				>
					${messages.home.aboutText}
				</p>
				<p class="mt-6">
					<a
						href="${pagePath(locale, 'about')}"
						class="text-accent dark:text-accent-dark font-medium underline underline-offset-2 hover:no-underline"
						>${messages.home.aboutMore}</a
					>
				</p>
			</section>

			<!-- Technical focus -->
			<section class="py-16" aria-labelledby="technical-focus">
				${sectionHeading('technical-focus', messages.projects.technologiesLabel, messages.home.focusHeading)}
				<p class="text-ink-muted dark:text-snow-muted -mt-6 mb-10 max-w-2xl">
					${messages.home.focusIntro}
				</p>
				<div class="grid gap-6 sm:grid-cols-2">
					${FOCUS_AREAS.map(
						(area) =>
							html`<div
								class="rounded-card border-line dark:border-night-line border p-6"
							>
								<h3 class="text-lg font-semibold">${area.heading[locale]}</h3>
								<p
									class="text-ink-muted dark:text-snow-muted mt-2 leading-relaxed"
								>
									${area.text[locale]}
								</p>
								${techTags(area.keywords, messages.projects.technologiesLabel)}
							</div>`,
					)}
				</div>
			</section>

			<!-- Latest writing -->
			<section class="py-16" aria-labelledby="latest-writing">
				${sectionHeading('latest-writing', messages.nav.blog, messages.home.writingHeading)}
				<p class="text-ink-muted dark:text-snow-muted -mt-6 mb-10 max-w-2xl">
					${messages.home.writingIntro}
				</p>
				${
					latestPosts.length > 0
						? html`<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
								${latestPosts
									.slice(0, 3)
									.map((post) => blogCard(post, locale, messages))}
							</div>`
						: html`<p class="text-ink-muted dark:text-snow-muted">
								${messages.blog.empty}
							</p>`
				}
				<p class="mt-8">
					${buttonLink(
						pagePath(locale, 'blog'),
						messages.home.allPosts,
						'secondary',
					)}
				</p>
			</section>

			<!-- Contact CTA -->
			<section class="py-16" aria-labelledby="contact-cta">
				${sectionHeading('contact-cta', messages.nav.contact, messages.home.contactHeading)}
				<p
					class="text-ink-muted dark:text-snow-muted -mt-4 max-w-2xl leading-relaxed"
				>
					${messages.home.contactText}
				</p>
				<p class="mt-8 flex flex-wrap items-center gap-4">
					${buttonLink(`mailto:${OWNER.email}`, OWNER.email, 'primary')}
					${raw('<span class="text-ink-muted dark:text-snow-muted text-sm">')}${externalLink(
						OWNER.gitHubUrl,
						'GitHub',
						ctx.messages,
					)}${raw('</span>')}
				</p>
			</section>
		</div>
	`;

	return {
		meta: {
			locale,
			path: ctx.path,
			title: messages.home.title,
			description: messages.home.description,
			jsonLd: [
				personJsonLd(),
				webSiteJsonLd(locale),
				breadcrumbJsonLd([
					{ name: messages.nav.home, path: pagePath(locale, 'home') },
				]),
			],
		},
		main,
	};
}
