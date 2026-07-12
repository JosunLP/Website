/**
 * View-transition direction snippet, inlined into the document head. On
 * `pagereveal` it compares the previous and the new URL against the
 * header-navigation page order and tags the cross-document view
 * transition with a "forwards" or "backwards" type, which the CSS in
 * main.css turns into directional slide animations. Same-rank
 * navigations (e.g. switching the locale) keep the default fade.
 *
 * It must run before the first render opportunity, hence a
 * parser-blocking inline script rather than a deferred module. Browsers
 * without the Navigation API (no `navigation.activation`) simply keep
 * the default transition.
 *
 * It must stay byte-stable: the strict Content Security Policy allows
 * exactly this script via its SHA-256 hash (see
 * docs/security-headers.md; recompute with `bun run generate:csp-hash`
 * after any change).
 */
export const VIEW_TRANSITION_TYPES_SNIPPET =
	'(function(){addEventListener("pagereveal",function(e){var vt=e.viewTransition;var act=self.navigation&&navigation.activation;if(!vt||!act||!act.from)return;function rank(u){var s=new URL(u).pathname.replace(/^\\/[a-z]{2}(?=\\/|$)/,"").split("/").filter(Boolean);var i=["","about","projects","blog","contact"].indexOf(s[0]||"");return[i<0?9:i,s.length]}var f=rank(act.from.url),t=rank(act.entry.url);var d=t[0]!==f[0]?(t[0]>f[0]?"forwards":"backwards"):t[1]!==f[1]?(t[1]>f[1]?"forwards":"backwards"):"";if(d)vt.types.add(d);});})();';
