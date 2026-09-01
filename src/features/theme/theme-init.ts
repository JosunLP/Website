/**
 * Theme bootstrap snippet, inlined into the document head to avoid a
 * flash of the wrong color scheme. It must stay byte-stable: the strict
 * Content Security Policy allows exactly this script via its SHA-256
 * hash (see docs/security-headers.md; recompute with
 * `bun run generate:csp-hash` after any change).
 *
 * Behavior: an explicitly stored user preference wins; otherwise the
 * system preference applies and nothing is stored.
 *
 * It also drops the `no-js` class the server puts on <html>. That runs
 * outside the try/catch on purpose: a browser with scripting on but
 * localStorage blocked must still lose the class, or it keeps the
 * no-script navigation styling for the whole visit.
 */
export const THEME_INIT_SNIPPET =
	'(function(){document.documentElement.classList.remove("no-js");try{var t=localStorage.getItem("jp:theme");var d=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();';
