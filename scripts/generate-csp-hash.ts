import { createHash } from 'node:crypto';
import { VIEW_TRANSITION_TYPES_SNIPPET } from '@/features/navigation/view-transition-types';
import { THEME_INIT_SNIPPET } from '@/features/theme/theme-init';

/**
 * Prints the CSP hashes for the inline head snippets (theme bootstrap
 * and view-transition direction tagging). Update
 * docs/security-headers.md and the host configuration whenever one of
 * the snippets changes.
 */
function cspHash(source: string): string {
	const hash = createHash('sha256').update(source, 'utf8').digest('base64');
	return `'sha256-${hash}'`;
}

console.log(`theme-init:            ${cspHash(THEME_INIT_SNIPPET)}`);
console.log(`view-transition-types: ${cspHash(VIEW_TRANSITION_TYPES_SNIPPET)}`);
