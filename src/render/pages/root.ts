import { OWNER } from '@/app/configuration';
import { expertiseTopics } from '@/content/skills';
import { ENTITY_ID, pageGraphJsonLd } from '@/domain/services/seo';
import type { RenderContext } from '@/render/layout';
import { siteLogo } from '@/render/logo';
import { html } from '@/utils/html';
import type { RenderedPage } from './types';

/**
 * Root locale-decision page (`/`). With JavaScript, `locale-redirect.ts`
 * navigates to the stored preference or the negotiated browser language
 * (fallback: German). Without JavaScript, both locale entry points are
 * visible immediately — nobody is trapped.
 */
export function renderRootPage(ctx: RenderContext): RenderedPage {
	const meta = {
		locale: ctx.locale,
		path: '/',
		title: `${OWNER.name} — ${OWNER.alias}`,
		description:
			'Jonas Pfalzgraf (JosunLP), Full-Stack-Entwickler und Open-Source-Maintainer. Diese Website gibt es auf Deutsch und Englisch. / Also available in English.',
	};
	return {
		meta: {
			...meta,
			jsonLd: [
				pageGraphJsonLd({
					meta,
					mainEntity: ENTITY_ID.person,
					about: ENTITY_ID.person,
					knowsAbout: expertiseTopics(),
				}),
			],
		},
		main: html`
			<main
				id="main-content"
				class="flex min-h-screen items-center justify-center px-4"
			>
				<div class="w-full max-w-md">
					${siteLogo(64, 'h-16 w-16')}
					<h1 class="jp-display mt-10 text-3xl">${OWNER.name}</h1>
					<p
						class="jp-meta text-ink-muted dark:text-snow-muted border-line dark:border-night-line mt-6 border-t pt-6 leading-relaxed"
					>
						<span lang="de"
							>Diese Website ist auf Deutsch und Englisch verfügbar.</span
						>
						<span lang="en" class="mt-1 block"
							>This website is available in German and English.</span
						>
					</p>
					<nav aria-label="Sprache / Language" class="mt-8">
						<ul class="flex gap-3">
							<li>
								<a
									href="/de/"
									hreflang="de"
									lang="de"
									class="jp-btn jp-btn--primary"
									>Deutsch</a
								>
							</li>
							<li>
								<a
									href="/en/"
									hreflang="en"
									lang="en"
									class="jp-btn jp-btn--secondary"
									>English</a
								>
							</li>
						</ul>
					</nav>
				</div>
			</main>
		`,
		options: {
			bare: true,
			langOverride: 'de',
			extraScripts: ['locale-redirect'],
		},
	};
}
