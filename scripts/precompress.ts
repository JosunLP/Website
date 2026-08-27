import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

/**
 * Writes `.br` and `.gz` siblings for every compressible file in `dist/`.
 *
 * The site targets plain static hosting, where on-the-fly compression is
 * either unavailable or configured at a low, latency-driven level.
 * Compressing once at build time lets the server hand out a
 * maximum-quality artefact for free (Apache `mod_deflate` /
 * `MultiViews`, nginx `gzip_static` + `brotli_static` — see
 * `examples/hosting/`), and leaves the original in place for clients that
 * accept neither encoding.
 */
const DIST = join(process.cwd(), 'dist');

/** Text formats only; images and fonts are already compressed. */
const COMPRESSIBLE = new Set([
	'.html',
	'.css',
	'.js',
	'.mjs',
	'.json',
	'.xml',
	'.svg',
	'.txt',
	'.md',
	'.webmanifest',
]);

/**
 * Below roughly one MTU the compressed copy rarely arrives in fewer
 * packets, and it costs an extra file on disk and an extra stat per
 * request.
 */
const MIN_BYTES = 1024;

function walk(dir: string): string[] {
	const files: string[] = [];
	for (const name of readdirSync(dir)) {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) {
			files.push(...walk(full));
		} else {
			files.push(full);
		}
	}
	return files;
}

let count = 0;
let originalBytes = 0;
let brotliBytes = 0;

for (const file of walk(DIST)) {
	if (file.endsWith('.br') || file.endsWith('.gz')) {
		continue;
	}
	if (!COMPRESSIBLE.has(extname(file).toLowerCase())) {
		continue;
	}
	const source = readFileSync(file);
	if (source.length < MIN_BYTES) {
		continue;
	}
	const brotli = brotliCompressSync(source, {
		params: {
			[constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
			[constants.BROTLI_PARAM_SIZE_HINT]: source.length,
		},
	});
	const gzip = gzipSync(source, { level: 9 });
	writeFileSync(`${file}.br`, brotli);
	writeFileSync(`${file}.gz`, gzip);
	count += 1;
	originalBytes += source.length;
	brotliBytes += brotli.length;
}

const saved =
	originalBytes === 0 ? 0 : Math.round((1 - brotliBytes / originalBytes) * 100);
console.log(
	`Precompressed ${String(count)} files (${String(
		Math.round(originalBytes / 1024),
	)} kB → ${String(Math.round(brotliBytes / 1024))} kB brotli, −${String(
		saved,
	)}%).`,
);
