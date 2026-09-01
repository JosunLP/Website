import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OG_IMAGE } from '@/app/configuration';
import {
	Canvas,
	oklch,
	rgb,
	roundedRect,
	type Polygon,
	type Rgb,
} from './lib/raster';
import { parseSvgShapes } from './lib/svg-shapes';

/**
 * Generates `public/og-image.png` — the 1200×630 social preview card
 * referenced by `og:image` / `twitter:image`.
 *
 * Link previews are the site's only rendering that lives outside the
 * browser, so it is worth one purpose-built image instead of a favicon
 * scaled into a small summary card. The card is drawn from the real logo
 * geometry and the design tokens in `src/styles/main.css`, with no image
 * toolchain involved (see `scripts/lib/raster.ts`).
 *
 * The composition follows the site: a plain ink field, the mark, and the
 * accent as a single rule. Nothing textured sits behind it — a preview
 * card is shown at thumbnail size, where any pattern turns to noise.
 */

// Design tokens, mirrored from src/styles/main.css.
const NIGHT = oklch(0.165, 0.003, 95);
const SNOW = oklch(0.945, 0.002, 95);
const NIGHT_LINE = oklch(0.31, 0.004, 95);

const ROOT = process.cwd();

/** Maps logo-local coordinates into a square on the canvas. */
function placeLogo(
	canvas: Canvas,
	svgSource: string,
	x: number,
	y: number,
	size: number,
): void {
	const { viewBox, shapes } = parseSvgShapes(svgSource);
	const [minX, minY, width, height] = viewBox;
	const scale = size / Math.max(width, height);
	const offsetX = x + (size - width * scale) / 2;
	const offsetY = y + (size - height * scale) / 2;
	const project = (polygon: Polygon): Polygon => {
		const points: number[] = [];
		for (let index = 0; index < polygon.length; index += 2) {
			points.push(
				offsetX + ((polygon[index] ?? 0) - minX) * scale,
				offsetY + ((polygon[index + 1] ?? 0) - minY) * scale,
			);
		}
		return points;
	};
	for (const shape of shapes) {
		canvas.fill(shape.polygons.map(project), colorOf(shape.fill));
	}
}

/** Resolves the fill syntaxes the logo files actually use. */
function colorOf(fill: string): Rgb {
	if (fill === 'white') {
		return SNOW;
	}
	const rgbMatch = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(fill);
	if (rgbMatch !== null) {
		return rgb(Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3]));
	}
	const hexMatch = /^#([0-9a-f]{6})$/i.exec(fill);
	if (hexMatch !== null) {
		const value = Number.parseInt(hexMatch[1] ?? '0', 16);
		return rgb((value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff);
	}
	throw new Error(`unsupported fill in logo: ${fill}`);
}

const canvas = new Canvas(OG_IMAGE.width, OG_IMAGE.height, NIGHT);

// A margin rule frames the card the way the site's hairlines frame a
// section — the only structure the composition needs.
const margin = 72;
const hairline = 2;
for (const rule of [
	roundedRect(margin, margin, OG_IMAGE.width - margin * 2, hairline),
	roundedRect(
		margin,
		OG_IMAGE.height - margin - hairline,
		OG_IMAGE.width - margin * 2,
		hairline,
	),
]) {
	canvas.fill([rule], NIGHT_LINE);
}

// The mark, and nothing else. It already carries the accent red, so a
// second red rule under it would put two near-identical reds side by
// side at thumbnail size — which reads as a mistake rather than a system.
const mark = 300;
placeLogo(
	canvas,
	readFileSync(join(ROOT, 'public', 'images', 'logo-jonas-dark.svg'), 'utf8'),
	(OG_IMAGE.width - mark) / 2,
	(OG_IMAGE.height - mark) / 2,
	mark,
);

const target = join(ROOT, 'public', OG_IMAGE.path.slice(1));
const png = canvas.toPng();
writeFileSync(target, png);
console.log(
	`public${OG_IMAGE.path} written (${String(OG_IMAGE.width)}×${String(
		OG_IMAGE.height,
	)}, ${String(Math.round(png.length / 1024))} kB).`,
);
