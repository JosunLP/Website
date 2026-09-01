/**
 * View-transition snippet, inlined into the document head. On
 * `pagereveal` it does two things:
 *
 * 1. Interaction safety: while the cross-document transition is
 *    running, its snapshot pseudo-tree overlays the viewport and a
 *    click can be swallowed instead of reaching the page (reproduced
 *    with rapid nav click-chains in Edge). A `pointerdown` during the
 *    transition therefore skips it immediately — the snapshots vanish
 *    and the interaction lands on the real DOM.
 *
 * 2. Direction tagging: it compares the previous and the new URL
 *    against the header-navigation page order and tags the transition
 *    with a "forwards" or "backwards" type, which the CSS in main.css
 *    turns into directional slide animations. Same-rank navigations
 *    (e.g. switching the locale) keep the default fade. Browsers
 *    without the Navigation API (no `navigation.activation`) simply
 *    keep the default transition.
 *
 *    The inlined page order must mirror `HEADER_NAV` in
 *    src/app/configuration.ts — a snippet cannot import it. The order
 *    is asserted in tests/routes.test.ts so the two cannot drift.
 *
 * The cleanup is attached with `.then(clean, clean)` rather than
 * `.finally(clean)` on purpose. `vt.finished` *rejects* with
 * `AbortError: Transition was skipped` whenever the transition is
 * skipped — which point 1 above does deliberately, on every rapid click.
 * `.finally()` returns a new promise that inherits that rejection, so
 * the routine case logged `Uncaught (in promise) AbortError` in the
 * console. A two-argument `then` handles the rejection instead of
 * passing it on.
 *
 * It must run before the first render opportunity, hence a
 * parser-blocking inline script rather than a deferred module. It must
 * stay byte-stable: the strict Content Security Policy allows exactly
 * this script via its SHA-256 hash (see docs/security-headers.md;
 * recompute with `bun run generate:csp-hash` after any change).
 */
export const VIEW_TRANSITION_TYPES_SNIPPET =
	'(function(){addEventListener("pagereveal",function(e){var vt=e.viewTransition;if(!vt)return;var skip=function(){vt.skipTransition()};addEventListener("pointerdown",skip,true);var clean=function(){removeEventListener("pointerdown",skip,true)};vt.finished.then(clean,clean);var act=self.navigation&&navigation.activation;if(!act||!act.from)return;function rank(u){var s=new URL(u).pathname.replace(/^\\/[a-z]{2}(?=\\/|$)/,"").split("/").filter(Boolean);var i=["","projects","blog","about","contact"].indexOf(s[0]||"");return[i<0?9:i,s.length]}var f=rank(act.from.url),t=rank(act.entry.url);var d=t[0]!==f[0]?(t[0]>f[0]?"forwards":"backwards"):t[1]!==f[1]?(t[1]>f[1]?"forwards":"backwards"):"";if(d&&vt.types)vt.types.add(d);});})();';
