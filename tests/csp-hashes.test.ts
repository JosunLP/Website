import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VIEW_TRANSITION_TYPES_SNIPPET } from '@/features/navigation/view-transition-types';
import { THEME_INIT_SNIPPET } from '@/features/theme/theme-init';

/**
 * The strict CSP allows the two inline head snippets by SHA-256 hash, so
 * editing a snippet without updating the deployed policy silently blocks
 * it in production — a flash of the wrong theme, and page transitions
 * that lose their direction. The failure never shows up in a build, only
 * on the live site, so it is guarded here instead.
 */
const CONFIGS = [
	'docs/security-headers.md',
	'examples/hosting/.htaccess',
	'examples/hosting/nginx.conf',
];

function cspHash(source: string): string {
	return `sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}`;
}

describe('CSP script hashes', () => {
	const hashes = {
		'theme-init': cspHash(THEME_INIT_SNIPPET),
		'view-transition-types': cspHash(VIEW_TRANSITION_TYPES_SNIPPET),
	};

	for (const config of CONFIGS) {
		const content = readFileSync(join(process.cwd(), config), 'utf8');
		for (const [name, hash] of Object.entries(hashes)) {
			it(`${config} allows the current ${name} snippet`, () => {
				expect(
					content,
					`run \`bun run generate:csp-hash\` and update ${config}`,
				).toContain(hash);
			});
		}
	}
});
