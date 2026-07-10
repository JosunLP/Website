import { createHash } from 'node:crypto';
import { THEME_INIT_SNIPPET } from '@/features/theme/theme-init';

/**
 * Prints the CSP hash for the inline theme-bootstrap script. Update
 * docs/security-headers.md and the host configuration whenever the
 * snippet changes.
 */
const hash = createHash('sha256')
	.update(THEME_INIT_SNIPPET, 'utf8')
	.digest('base64');
console.log(`'sha256-${hash}'`);
