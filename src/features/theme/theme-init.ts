/**
 * Theme bootstrap snippet, inlined into the document head to avoid a
 * flash of the wrong color scheme. It must stay byte-stable: the strict
 * Content Security Policy allows exactly this script via its SHA-256
 * hash (see docs/security-headers.md; recompute with
 * `bun run generate:csp-hash` after any change).
 *
 * Behavior: an explicitly stored user preference wins; otherwise the
 * system preference applies and nothing is stored.
 */
export const THEME_INIT_SNIPPET =
	'(function(){try{var t=localStorage.getItem("jp:theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();';
