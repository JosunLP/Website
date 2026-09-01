import {
	FOOTER_LEGAL_NAV,
	HEADER_NAV,
	OWNER,
	pagePath,
	type PageId,
} from '@/app/configuration';
import { equivalentPath } from '@/app/routes';
import { LOCALES, type Locale } from '@/domain/models/locale';
import { feedPath } from '@/domain/services/feed';
import { renderHeadMeta, type PageMeta } from '@/domain/services/seo';
import { messagesFor } from '@/features/i18n';
import type { AppMessages } from '@/features/i18n/messages';
import { VIEW_TRANSITION_TYPES_SNIPPET } from '@/features/navigation/view-transition-types';
import { THEME_INIT_SNIPPET } from '@/features/theme/theme-init';
import { escape, html, raw, type SafeHtml } from '@/utils/html';
import { LOGO_SPRITE, siteLogo } from './logo';
import { externalLink } from './ui';

/**
 * Resolves module/CSS URLs. In production these come from Vite's build
 * manifest (hashed file names); in development they are plain source
 * paths served by the Vite dev server.
 */
export interface AssetResolver {
	/** URL of a built entry module, e.g. "bootstrap". */
	script(entry: string): string;
	/** Stylesheet URLs to include (deduplicated). */
	styles(): readonly string[];
	/** Extra head markup (e.g. Vite dev client). */
	extraHead(): string;
	/**
	 * Shared chunk URLs imported by the given entries. Emitted as
	 * `<link rel="modulepreload">` so the browser fetches them together
	 * with the entry instead of discovering them one network round trip
	 * later. Only meaningful for production builds.
	 */
	modulePreloads?(entries: readonly string[]): readonly string[];
}

export interface RenderContext {
	readonly locale: Locale;
	/** Site-absolute path of the page being rendered. */
	readonly path: string;
	readonly messages: AppMessages;
	readonly assets: AssetResolver;
}

export function createRenderContext(
	locale: Locale,
	path: string,
	assets: AssetResolver,
): RenderContext {
	return { locale, path, messages: messagesFor(locale), assets };
}

function navLabel(messages: AppMessages, page: PageId): string {
	return messages.nav[page];
}

function isCurrentPage(ctx: RenderContext, page: PageId): boolean {
	const target = pagePath(ctx.locale, page);
	if (page === 'home') {
		return ctx.path === target;
	}
	return ctx.path.startsWith(target);
}

/**
 * Language switcher markup. Works without JavaScript (plain links to the
 * equivalent route); the jp-language-switcher island only adds preference
 * persistence on explicit selection.
 */
function languageSwitcher(ctx: RenderContext, idSuffix: string): SafeHtml {
	const { messages } = ctx;
	// The header switcher is a nav landmark; the footer one is a plain
	// labelled group so the two landmarks stay unique (WCAG/axe
	// landmark-unique).
	const isLandmark = idSuffix === 'header';
	return html`<jp-language-switcher>
		<${raw(isLandmark ? 'nav' : 'div role="group"')} aria-label="${messages.language.switcherLabel}">
			<ul class="jp-meta flex items-center">
				${LOCALES.map((locale, index) => {
					const current = locale === ctx.locale;
					const label = messages.language[locale];
					return html`${
							index > 0
								? raw(
										'<li aria-hidden="true" class="text-line-strong dark:text-night-line-strong">/</li>',
									)
								: null
						}
						<li>
							<a
								href="${equivalentPath(ctx.path, locale)}"
								hreflang="${locale}"
								lang="${locale}"
								data-locale="${locale}"
								id="${`lang-${locale}-${idSuffix}`}"
								${current ? raw('aria-current="true"') : null}
								class="${
									current
										? 'text-ink dark:text-snow inline-flex min-h-9 items-center px-1.5'
										: 'jp-link-quiet inline-flex min-h-9 items-center px-1.5'
								}"
								>${locale.toUpperCase()}<span class="sr-only">
									—
									${label}${
										current ? html` (${messages.language.current})` : null
									}</span
								></a
							>
						</li>`;
				})}
			</ul>
		</${raw(isLandmark ? 'nav' : 'div')}>
	</jp-language-switcher>`;
}

function themeToggle(messages: AppMessages): SafeHtml {
	// Rendered as an empty island: theme switching requires JavaScript, so
	// the control only appears when the component upgrades. Labels are
	// passed as data attributes to keep the component locale-agnostic.
	return html`<jp-theme-toggle
		data-label="${messages.theme.toggleLabel}"
		data-light="${messages.theme.light}"
		data-dark="${messages.theme.dark}"
		data-system="${messages.theme.system}"
	></jp-theme-toggle>`;
}

/**
 * Site header: the mark, the navigation, the two preference controls.
 *
 * Opaque rather than translucent-and-blurred. A blurred bar smears
 * whatever scrolls under it, which is exactly the kind of effect that
 * looks impressive in a screenshot and makes running text harder to read
 * in use. A single hairline does the same job of separating the bar from
 * the page.
 *
 * The navigation list is rendered collapsed (`hidden … md:flex`) — the
 * state jp-site-nav would otherwise have to put it in after the first
 * paint, at the cost of a large layout shift on every mobile load. The
 * `.no-js` rules in main.css invert it for readers without scripting.
 */
function siteHeader(ctx: RenderContext): SafeHtml {
	const { messages, locale } = ctx;
	return html`<header
		class="border-line dark:border-night-line bg-paper dark:bg-night sticky top-0 z-40 border-b"
	>
		<div
			class="relative mx-auto flex max-w-5xl items-center justify-between gap-x-4 px-4 py-4 sm:px-6"
		>
			<a
				href="${pagePath(locale, 'home')}"
				class="flex min-w-0 items-center gap-3"
			>
				${siteLogo(32, 'h-7 w-7 shrink-0')}
				<span class="min-w-0 truncate font-medium tracking-tight"
					>${messages.siteName}</span
				>
			</a>
			<div class="flex shrink-0 items-center gap-2 sm:gap-6">
				<jp-site-nav>
					<button
						type="button"
						data-nav-toggle
						aria-expanded="false"
						aria-controls="main-nav"
						class="border-line dark:border-night-line rounded-ui inline-flex min-h-11 min-w-11 items-center justify-center border md:hidden"
					>
						<span
							class="sr-only"
							data-open-label="${messages.nav.openMenu}"
							data-close-label="${messages.nav.closeMenu}"
							>${messages.nav.openMenu}</span
						>
						<svg
							viewBox="0 0 24 24"
							class="h-4 w-4"
							aria-hidden="true"
							focusable="false"
						>
							<path
								d="M4 8h16M4 16h16"
								stroke="currentColor"
								stroke-width="1.75"
								stroke-linecap="round"
							/>
						</svg>
					</button>
					<nav aria-label="${messages.nav.mainNavLabel}">
						<ul
							id="main-nav"
							class="hidden flex-wrap items-center gap-x-6 gap-y-1 text-sm md:flex"
						>
							${HEADER_NAV.map((page) => {
								const current = isCurrentPage(ctx, page);
								// Full-width, 44px tap targets inside the mobile panel;
								// plain inline links from `md` up.
								const base =
									'flex min-h-11 w-full items-center md:min-h-9 md:w-auto';
								return html`<li class="w-full md:w-auto">
									<a
										href="${pagePath(locale, page)}"
										${current ? raw('aria-current="page"') : null}
										class="${
											current
												? // The current page is marked with the accent
													// underline rather than a filled tab: one rule
													// of colour, no extra shape.
													`${base} text-ink dark:text-snow decoration-accent dark:decoration-accent-dark underline decoration-1 underline-offset-[0.4rem]`
												: `${base} jp-link-quiet`
										}"
										>${navLabel(messages, page)}</a
									>
								</li>`;
							})}
						</ul>
					</nav>
				</jp-site-nav>
				<div
					class="border-line dark:border-night-line flex items-center gap-1 border-l pl-2 sm:pl-4"
				>
					${languageSwitcher(ctx, 'header')} ${themeToggle(messages)}
				</div>
			</div>
		</div>
	</header>`;
}

const FOOTER_LINK_CLASS = 'jp-link-quiet inline-flex min-h-8 items-center';

/**
 * Footer column heading. Each one names its group through
 * `aria-labelledby` rather than a second `aria-label`, so the footer's
 * landmarks stay uniquely named against the header's navigation.
 */
function footerColumnHeading(id: string, label: string): SafeHtml {
	return html`<h2
		id="${id}"
		class="jp-label text-ink-muted dark:text-snow-muted mb-4"
	>
		${label}
	</h2>`;
}

function siteFooter(ctx: RenderContext): SafeHtml {
	const { messages, locale } = ctx;
	return html`<footer class="border-line dark:border-night-line mt-32 border-t">
		<div
			class="jp-meta text-ink-muted dark:text-snow-muted mx-auto grid max-w-5xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]"
		>
			<div>
				<div class="flex items-center gap-3">
					${siteLogo(28, 'h-7 w-7')}
					<p class="text-ink dark:text-snow font-sans font-medium">
						${messages.siteName}
					</p>
				</div>
				<p class="mt-4 max-w-[26ch] leading-relaxed">${messages.siteTagline}</p>
			</div>

			<nav aria-labelledby="footer-explore">
				${footerColumnHeading('footer-explore', messages.footer.exploreLabel)}
				<ul>
					${HEADER_NAV.filter((page) => page !== 'home').map(
						(page) =>
							html`<li>
								<a href="${pagePath(locale, page)}" class="${FOOTER_LINK_CLASS}"
									>${navLabel(messages, page)}</a
								>
							</li>`,
					)}
					<li>
						<a href="${feedPath(locale)}" class="${FOOTER_LINK_CLASS}"
							>${messages.footer.feed}</a
						>
					</li>
				</ul>
			</nav>

			<nav aria-labelledby="footer-legal">
				${footerColumnHeading('footer-legal', messages.nav.legalNavLabel)}
				<ul>
					${FOOTER_LEGAL_NAV.map(
						(page) =>
							html`<li>
								<a href="${pagePath(locale, page)}" class="${FOOTER_LINK_CLASS}"
									>${navLabel(messages, page)}</a
								>
							</li>`,
					)}
					<li>
						<a
							href="${pagePath(locale, 'privacy')}#local-preferences"
							class="${FOOTER_LINK_CLASS}"
							>${messages.footer.privacyPreferences}</a
						>
					</li>
				</ul>
			</nav>

			<div>
				${footerColumnHeading('footer-social', messages.footer.socialLabel)}
				<ul aria-labelledby="footer-social">
					<li>
						${externalLink(
							OWNER.gitHubUrl,
							'GitHub',
							messages,
							FOOTER_LINK_CLASS,
						)}
					</li>
					<li>
						${externalLink(OWNER.koFiUrl, 'Ko-fi', messages, FOOTER_LINK_CLASS)}
					</li>
					<li>
						${externalLink(
							'https://github.com/JosunLP/Website',
							messages.footer.sourceNote,
							messages,
							FOOTER_LINK_CLASS,
						)}
					</li>
				</ul>
			</div>
		</div>

		<div
			class="border-line dark:border-night-line jp-meta text-ink-muted dark:text-snow-muted mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 border-t px-4 py-6 sm:px-6"
		>
			${languageSwitcher(ctx, 'footer')}
			<a href="#main-content" class="${FOOTER_LINK_CLASS}"
				>${messages.footer.backToTop}<span aria-hidden="true"> ↑</span></a
			>
		</div>
	</footer>`;
}

export interface DocumentOptions {
	/** Additional entry modules to load (besides "bootstrap"). */
	readonly extraScripts?: readonly string[];
	/** Skips header/footer (used by the root locale-decision page). */
	readonly bare?: boolean;
	/** Sets `lang` explicitly (root page uses "de" as x-default). */
	readonly langOverride?: string;
}

/** Renders a complete HTML document for a page. */
export function renderDocument(
	ctx: RenderContext,
	meta: PageMeta,
	main: SafeHtml,
	options: DocumentOptions = {},
): string {
	const { messages, assets } = ctx;
	// The bare root page has no header, footer, theme toggle or nav — the
	// three things the global bundle exists for. It only decides a locale
	// and leaves, so it loads only what does that.
	const scripts = options.bare
		? [...(options.extraScripts ?? [])]
		: ['bootstrap', ...(options.extraScripts ?? [])];
	const styleLinks = assets
		.styles()
		.map((href) => `<link rel="stylesheet" href="${escape(href)}">`)
		.join('\n\t\t');
	const preloadLinks = (assets.modulePreloads?.(scripts) ?? [])
		.map((href) => `<link rel="modulepreload" href="${escape(href)}">`)
		.join('\n\t\t');
	const scriptTags = scripts
		.map(
			(entry) =>
				`<script type="module" src="${escape(assets.script(entry))}"></script>`,
		)
		.join('\n\t\t');
	const body = options.bare
		? html`${LOGO_SPRITE}${main}`
		: html`${LOGO_SPRITE}<a
					href="#main-content"
					class="focus:bg-ink focus:text-paper focus:rounded-ui dark:focus:bg-snow dark:focus:text-night sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2"
					>${messages.skipToContent}</a
				>
				${siteHeader(ctx)}
				<main id="main-content" tabindex="-1">${main}</main>
				${siteFooter(ctx)}`;
	return `<!doctype html>
<html lang="${escape(options.langOverride ?? ctx.locale)}" class="no-js">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<script>${THEME_INIT_SNIPPET}</script>
		<script>${VIEW_TRANSITION_TYPES_SNIPPET}</script>
		${
			// Two deliberate omissions, both reproduced with a rapid
			// click-chain against a throttled server (Edge, headless):
			//  - NO <link rel="expect" blocking="render">: it held the first
			//    paint until the whole <main> was parsed, freezing the old
			//    page for the entire fetch+parse of every navigation.
			//  - NO <script type="speculationrules">: clicking a link whose
			//    hover-triggered prefetch/prerender was still in flight
			//    intermittently swallowed the click (prerender even wedged
			//    the navigation for seconds). These pages are tiny static
			//    files — navigation without speculation measured 60-190ms,
			//    so speculation only added risk.
			''
		}${renderHeadMeta(meta).value}
		<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbfaf8">
		<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#141413">
		<link rel="icon" href="/favicon.ico" sizes="32x32">
		<link rel="icon" href="/favicon-32x32.png" type="image/png">
		<link rel="apple-touch-icon" href="/apple-touch-icon.png">
		<link rel="manifest" href="/site.webmanifest">
		<link rel="alternate" type="application/atom+xml" title="${escape(messages.blog.feedTitle)}" href="${escape(feedPath(ctx.locale))}">
		${styleLinks}
		${preloadLinks}
		${assets.extraHead()}
		${scriptTags}
	</head>
	<body>
		${body.value}
	</body>
</html>
`;
}
