import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { OG_IMAGE } from '@/app/configuration';
import {
	Canvas,
	circle,
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
 */

// Design tokens, mirrored from src/styles/main.css.
const NIGHT = oklch(0.19, 0.02, 270);
const NIGHT_RAISED = oklch(0.24, 0.02, 270);
const ACCENT_DARK = oklch(0.78, 0.1, 250);
const SNOW = oklch(0.93, 0.005, 95);

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

/**
 * The "modular systems" motif used across the site, scaled up as a faint
 * background texture. Deterministic, so the file only changes when this
 * code does.
 */
function drawMotif(canvas: Canvas): void {
	const cell = 60;
	let state = 7 * 2654435761;
	const random = (): number => {
		state = (state * 1103515245 + 12345) & 0x7fffffff;
		return state / 0x7fffffff;
	};
	for (let column = 0; column * cell < canvas.width; column += 1) {
		for (let row = 0; row * cell < canvas.height; row += 1) {
			const value = random();
			const x = column * cell;
			const y = row * cell;
			if (value > 0.62) {
				canvas.fill(
					[roundedRect(x + 14, y + 14, cell - 28, cell - 28, 8)],
					ACCENT_DARK,
					value > 0.85 ? 0.16 : 0.08,
				);
			} else if (value > 0.45) {
				canvas.fill([circle(x + cell / 2, y + cell / 2, 5)], ACCENT_DARK, 0.12);
			}
		}
	}
}

const canvas = new Canvas(OG_IMAGE.width, OG_IMAGE.height, NIGHT);

drawMotif(canvas);

// Raised plate behind the mark: keeps the logo legible wherever the
// motif happens to sit, and gives the card a clear focal point.
const plate = 400;
const plateX = (OG_IMAGE.width - plate) / 2;
const plateY = (OG_IMAGE.height - plate) / 2 - 14;
canvas.fill([roundedRect(plateX, plateY, plate, plate, 40)], NIGHT_RAISED);

placeLogo(
	canvas,
	readFileSync(join(ROOT, 'public', 'images', 'logo-jonas-dark.svg'), 'utf8'),
	plateX + 60,
	plateY + 60,
	plate - 120,
);

// Accent rule along the bottom edge, echoing the site's focus colour.
canvas.fill(
	[roundedRect(0, OG_IMAGE.height - 12, OG_IMAGE.width, 12)],
	ACCENT_DARK,
);

const target = join(ROOT, 'public', OG_IMAGE.path.slice(1));
const png = canvas.toPng();
writeFileSync(target, png);
console.log(
	`public${OG_IMAGE.path} written (${String(OG_IMAGE.width)}×${String(
		OG_IMAGE.height,
	)}, ${String(Math.round(png.length / 1024))} kB).`,
);
