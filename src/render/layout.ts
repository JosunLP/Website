import {
	FOOTER_LEGAL_NAV,
	HEADER_NAV,
	OWNER,
	pagePath,
	type PageId,
} from '@/app/configuration';
import { equivalentPath } from '@/app/routes';
import { LOCALES, type Locale } from '@/domain/models/locale';
import { renderHeadMeta, type PageMeta } from '@/domain/services/seo';
import { messagesFor } from '@/features/i18n';
import type { AppMessages } from '@/features/i18n/messages';
import { VIEW_TRANSITION_TYPES_SNIPPET } from '@/features/navigation/view-transition-types';
import { THEME_INIT_SNIPPET } from '@/features/theme/theme-init';
import { escape, html, raw, type SafeHtml } from '@/utils/html';
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
			<ul class="flex items-center gap-1 text-sm">
				${LOCALES.map((locale, index) => {
					const current = locale === ctx.locale;
					const label = messages.language[locale];
					return html`${
							index > 0
								? raw(
										'<li aria-hidden="true" class="text-line dark:text-night-line">/</li>',
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
										? 'inline-flex min-h-9 items-center rounded-full px-2.5 font-semibold text-ink dark:text-snow'
										: 'inline-flex min-h-9 items-center rounded-full px-2.5 text-ink-muted hover:text-accent dark:text-snow-muted dark:hover:text-accent-dark'
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

function siteHeader(ctx: RenderContext): SafeHtml {
	const { messages, locale } = ctx;
	return html`<header
		class="border-line dark:border-night-line bg-paper/85 dark:bg-night/85 sticky top-0 z-40 border-b backdrop-blur-md"
	>
		<div
			class="relative mx-auto flex max-w-6xl items-center justify-between gap-x-4 gap-y-3 px-4 py-3 sm:px-6 sm:py-4"
		>
			<a
				href="${pagePath(locale, 'home')}"
				class="flex min-w-0 items-center gap-2.5 text-lg font-semibold tracking-tight sm:gap-3"
			>
				<img
					src="/images/logo-jonas-light.svg"
					alt=""
					width="40"
					height="40"
					class="h-9 w-9 shrink-0 dark:hidden sm:h-10 sm:w-10"
				/>
				<img
					src="/images/logo-jonas-dark.svg"
					alt=""
					width="40"
					height="40"
					class="hidden h-9 w-9 shrink-0 dark:block sm:h-10 sm:w-10"
				/>
				<span class="min-w-0 truncate">
					${messages.siteName}
					<span
						class="text-ink-muted dark:text-snow-muted block truncate text-xs font-normal"
						>${messages.siteTagline}</span
					>
				</span>
			</a>
			<div class="flex shrink-0 items-center gap-1 sm:gap-4">
				${languageSwitcher(ctx, 'header')} ${themeToggle(messages)}
				<jp-site-nav>
					<button
						type="button"
						data-nav-toggle
						aria-expanded="false"
						aria-controls="main-nav"
						class="border-line dark:border-night-line inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border md:hidden"
						hidden
					>
						<span
							class="sr-only"
							data-open-label="${messages.nav.openMenu}"
							data-close-label="${messages.nav.closeMenu}"
							>${messages.nav.openMenu}</span
						>
						<svg
							viewBox="0 0 24 24"
							class="h-5 w-5"
							aria-hidden="true"
							focusable="false"
						>
							<path
								d="M4 7h16M4 12h16M4 17h16"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					</button>
					<nav aria-label="${messages.nav.mainNavLabel}">
						<ul
							id="main-nav"
							class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium"
						>
							${HEADER_NAV.map((page) => {
								const current = isCurrentPage(ctx, page);
								// Full-width, 44px tap targets inside the mobile panel;
								// plain inline links from `md` up.
								const base =
									'flex min-h-11 w-full items-center rounded-lg px-3 md:min-h-9 md:w-auto md:rounded-none md:px-0';
								return html`<li class="w-full md:w-auto">
									<a
										href="${pagePath(locale, page)}"
										${current ? raw('aria-current="page"') : null}
										class="${
											current
												? `${base} text-accent dark:text-accent-dark bg-accent-soft/50 dark:bg-accent-dark-soft/40 md:bg-transparent md:dark:bg-transparent`
												: `${base} hover:text-accent dark:hover:text-accent-dark hover:bg-line/40 dark:hover:bg-night-line/30 md:hover:bg-transparent md:dark:hover:bg-transparent`
										}"
										>${navLabel(messages, page)}</a
									>
								</li>`;
							})}
						</ul>
					</nav>
				</jp-site-nav>
			</div>
		</div>
	</header>`;
}

function siteFooter(ctx: RenderContext): SafeHtml {
	const { messages, locale } = ctx;
	return html`<footer class="border-line dark:border-night-line mt-20 border-t">
		<div
			class="text-ink-muted dark:text-snow-muted mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 text-sm sm:px-6 md:flex-row md:justify-between"
		>
			<div class="space-y-3">
				<p class="text-ink dark:text-snow font-semibold">
					${messages.siteName}
				</p>
				<p>${messages.siteTagline}</p>
				<p aria-label="${messages.footer.socialLabel}">
					${externalLink(OWNER.gitHubUrl, 'GitHub', messages)} ·
					${externalLink(OWNER.koFiUrl, 'Ko-fi', messages)}
				</p>
			</div>
			<nav aria-label="${messages.nav.legalNavLabel}">
				<ul class="space-y-2">
					${FOOTER_LEGAL_NAV.map(
						(page) =>
							html`<li>
								<a
									href="${pagePath(locale, page)}"
									class="hover:text-accent dark:hover:text-accent-dark inline-flex min-h-9 items-center"
									>${navLabel(messages, page)}</a
								>
							</li>`,
					)}
					<li>
						<a
							href="${pagePath(locale, 'privacy')}#local-preferences"
							class="hover:text-accent dark:hover:text-accent-dark inline-flex min-h-9 items-center"
							>${messages.footer.privacyPreferences}</a
						>
					</li>
				</ul>
			</nav>
			<div class="space-y-2">
				${languageSwitcher(ctx, 'footer')}
				<p>
					${externalLink(
						'https://github.com/JosunLP/Website',
						messages.footer.sourceNote,
						messages,
					)}
				</p>
			</div>
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
	const scripts = ['bootstrap', ...(options.extraScripts ?? [])];
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
		? html`${main}`
		: html`<a
					href="#main-content"
					class="focus:bg-accent sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:px-4 focus:py-2 focus:text-white"
					>${messages.skipToContent}</a
				>
				${siteHeader(ctx)}
				<main id="main-content" tabindex="-1">${main}</main>
				${siteFooter(ctx)}`;
	return `<!doctype html>
<html lang="${escape(options.langOverride ?? ctx.locale)}">
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
		<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbfaf7">
		<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#20242f">
		<link rel="icon" href="/favicon.ico" sizes="32x32">
		<link rel="icon" href="/favicon-32x32.png" type="image/png">
		<link rel="apple-touch-icon" href="/apple-touch-icon.png">
		<link rel="manifest" href="/site.webmanifest">
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
