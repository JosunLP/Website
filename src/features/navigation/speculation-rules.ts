/**
 * Speculation Rules snippet, inlined into the document head as
 * `<script type="speculationrules">`. Browsers that support the
 * Speculation Rules API prefetch internal links on hover ("moderate")
 * and fully prerender them on pointer-down ("conservative"), making
 * page navigations feel near-instant. Unsupported browsers ignore the
 * script entirely.
 *
 * It must stay byte-stable: the strict Content Security Policy allows
 * exactly this script via its SHA-256 hash (see
 * docs/security-headers.md; recompute with `bun run generate:csp-hash`
 * after any change).
 */
export const SPECULATION_RULES_SNIPPET =
	'{"prefetch":[{"where":{"href_matches":"/*"},"eagerness":"moderate"}],"prerender":[{"where":{"href_matches":"/*"},"eagerness":"conservative"}]}';
