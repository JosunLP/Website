import { deflateSync } from 'node:zlib';

/**
 * Minimal rasterizer and PNG encoder.
 *
 * The site ships no image toolchain and no headless browser, but it does
 * need one generated bitmap: the social preview card (see
 * `scripts/generate-og-image.ts`). Everything that card needs is flat
 * colour over straight-edged shapes, so a scanline polygon filler plus a
 * PNG writer is enough — and it keeps the build dependency-free.
 */

/** Straight-line polygon: a flat list of alternating x/y coordinates. */
export type Polygon = readonly number[];

export interface Rgb {
	readonly r: number;
	readonly g: number;
	readonly b: number;
}

/** Vertical sub-samples per pixel row; horizontal coverage is exact. */
const SUB_ROWS = 4;

export class Canvas {
	readonly width: number;
	readonly height: number;
	/** Row-major RGB bytes, three per pixel. */
	private readonly pixels: Uint8ClampedArray;

	constructor(width: number, height: number, background: Rgb) {
		this.width = width;
		this.height = height;
		this.pixels = new Uint8ClampedArray(width * height * 3);
		for (let index = 0; index < width * height; index += 1) {
			this.pixels[index * 3] = background.r;
			this.pixels[index * 3 + 1] = background.g;
			this.pixels[index * 3 + 2] = background.b;
		}
	}

	/** Alpha-blends one pixel with the given coverage (0..1). */
	private blend(x: number, y: number, color: Rgb, alpha: number): void {
		if (alpha <= 0) {
			return;
		}
		const a = Math.min(1, alpha);
		const offset = (y * this.width + x) * 3;
		const inv = 1 - a;
		this.pixels[offset] = (this.pixels[offset] ?? 0) * inv + color.r * a;
		this.pixels[offset + 1] =
			(this.pixels[offset + 1] ?? 0) * inv + color.g * a;
		this.pixels[offset + 2] =
			(this.pixels[offset + 2] ?? 0) * inv + color.b * a;
	}

	/**
	 * Fills a set of polygons as one shape, so subpaths can punch holes.
	 * Uses the even-odd rule, matching the `fill-rule:evenodd` the source
	 * logo declares.
	 */
	fill(polygons: readonly Polygon[], color: Rgb, opacity = 1): void {
		const edges: { x0: number; y0: number; x1: number; y1: number }[] = [];
		let minY = Infinity;
		let maxY = -Infinity;
		let minX = Infinity;
		let maxX = -Infinity;
		for (const polygon of polygons) {
			const count = polygon.length / 2;
			for (let index = 0; index < count; index += 1) {
				const next = (index + 1) % count;
				const x0 = polygon[index * 2] ?? 0;
				const y0 = polygon[index * 2 + 1] ?? 0;
				const x1 = polygon[next * 2] ?? 0;
				const y1 = polygon[next * 2 + 1] ?? 0;
				if (y0 !== y1) {
					edges.push({ x0, y0, x1, y1 });
				}
				minY = Math.min(minY, y0);
				maxY = Math.max(maxY, y0);
				minX = Math.min(minX, x0);
				maxX = Math.max(maxX, x0);
			}
		}
		if (edges.length === 0) {
			return;
		}
		const firstRow = Math.max(0, Math.floor(minY));
		const lastRow = Math.min(this.height - 1, Math.ceil(maxY));
		const firstCol = Math.max(0, Math.floor(minX));
		const lastCol = Math.min(this.width - 1, Math.ceil(maxX));
		if (lastRow < firstRow || lastCol < firstCol) {
			return;
		}
		const coverage = new Float32Array(lastCol - firstCol + 1);
		const crossings: number[] = [];
		for (let y = firstRow; y <= lastRow; y += 1) {
			coverage.fill(0);
			for (let sub = 0; sub < SUB_ROWS; sub += 1) {
				const sampleY = y + (sub + 0.5) / SUB_ROWS;
				crossings.length = 0;
				for (const edge of edges) {
					const { x0, y0, x1, y1 } = edge;
					const inside =
						y0 <= sampleY ? sampleY < y1 : y1 <= sampleY && sampleY < y0;
					if (inside) {
						crossings.push(x0 + ((sampleY - y0) * (x1 - x0)) / (y1 - y0));
					}
				}
				if (crossings.length < 2) {
					continue;
				}
				crossings.sort((a, b) => a - b);
				for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
					const spanStart = Math.max(crossings[pair] ?? 0, firstCol);
					const spanEnd = Math.min(crossings[pair + 1] ?? 0, lastCol + 1);
					if (spanEnd <= spanStart) {
						continue;
					}
					const from = Math.floor(spanStart);
					const to = Math.ceil(spanEnd) - 1;
					for (let x = from; x <= to; x += 1) {
						const covered = Math.min(spanEnd, x + 1) - Math.max(spanStart, x);
						if (covered > 0) {
							const slot = x - firstCol;
							coverage[slot] = (coverage[slot] ?? 0) + covered / SUB_ROWS;
						}
					}
				}
			}
			for (let x = firstCol; x <= lastCol; x += 1) {
				this.blend(x, y, color, (coverage[x - firstCol] ?? 0) * opacity);
			}
		}
	}

	/** Encodes the canvas as an 8-bit truecolour PNG. */
	toPng(): Buffer {
		const stride = this.width * 3;
		// Filter type 2 ("Up") on every row: the design is built from flat
		// horizontal bands, which this filter reduces to runs of zeros.
		const raw = Buffer.allocUnsafe((stride + 1) * this.height);
		for (let y = 0; y < this.height; y += 1) {
			const rowStart = y * (stride + 1);
			raw[rowStart] = 2;
			for (let index = 0; index < stride; index += 1) {
				const current = this.pixels[y * stride + index] ?? 0;
				const above =
					y === 0 ? 0 : (this.pixels[(y - 1) * stride + index] ?? 0);
				raw[rowStart + 1 + index] = (current - above) & 0xff;
			}
		}
		const ihdr = Buffer.alloc(13);
		ihdr.writeUInt32BE(this.width, 0);
		ihdr.writeUInt32BE(this.height, 4);
		ihdr[8] = 8; // bit depth
		ihdr[9] = 2; // colour type: truecolour
		return Buffer.concat([
			Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
			chunk('IHDR', ihdr),
			chunk('IDAT', deflateSync(raw, { level: 9 })),
			chunk('IEND', Buffer.alloc(0)),
		]);
	}
}

const CRC_TABLE = ((): Uint32Array => {
	const table = new Uint32Array(256);
	for (let index = 0; index < 256; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) {
			value = (value & 1) === 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
		}
		table[index] = value >>> 0;
	}
	return table;
})();

function crc32(data: Buffer): number {
	let crc = 0xffffffff;
	for (const byte of data) {
		crc = (CRC_TABLE[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
	const length = Buffer.alloc(4);
	length.writeUInt32BE(data.length, 0);
	const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
	const crc = Buffer.alloc(4);
	crc.writeUInt32BE(crc32(body), 0);
	return Buffer.concat([length, body, crc]);
}

/* -------------------------------------------------------------------- */
/* Shape helpers                                                        */
/* -------------------------------------------------------------------- */

/** Axis-aligned rectangle with optional uniform corner radius. */
export function roundedRect(
	x: number,
	y: number,
	width: number,
	height: number,
	radius = 0,
): Polygon {
	const r = Math.min(radius, width / 2, height / 2);
	if (r <= 0) {
		return [x, y, x + width, y, x + width, y + height, x, y + height];
	}
	const points: number[] = [];
	const corners = [
		{ cx: x + width - r, cy: y + r, from: -Math.PI / 2 },
		{ cx: x + width - r, cy: y + height - r, from: 0 },
		{ cx: x + r, cy: y + height - r, from: Math.PI / 2 },
		{ cx: x + r, cy: y + r, from: Math.PI },
	];
	const steps = 8;
	for (const corner of corners) {
		for (let step = 0; step <= steps; step += 1) {
			const angle = corner.from + (step / steps) * (Math.PI / 2);
			points.push(
				corner.cx + Math.cos(angle) * r,
				corner.cy + Math.sin(angle) * r,
			);
		}
	}
	return points;
}

export function circle(cx: number, cy: number, radius: number): Polygon {
	const points: number[] = [];
	const steps = 48;
	for (let step = 0; step < steps; step += 1) {
		const angle = (step / steps) * Math.PI * 2;
		points.push(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
	}
	return points;
}

/* -------------------------------------------------------------------- */
/* Colour                                                               */
/* -------------------------------------------------------------------- */

/**
 * Converts an `oklch()` triple to sRGB bytes so generated imagery can use
 * the same colour values as the design tokens in `src/styles/main.css`.
 */
export function oklch(lightness: number, chroma: number, hue: number): Rgb {
	const hueRad = (hue * Math.PI) / 180;
	const a = chroma * Math.cos(hueRad);
	const b = chroma * Math.sin(hueRad);
	const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const linear = [
		4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
		-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
		-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
	].map((channel) => {
		const clamped = Math.min(1, Math.max(0, channel));
		const encoded =
			clamped <= 0.0031308
				? clamped * 12.92
				: 1.055 * clamped ** (1 / 2.4) - 0.055;
		return Math.round(encoded * 255);
	});
	return { r: linear[0] ?? 0, g: linear[1] ?? 0, b: linear[2] ?? 0 };
}

export function rgb(r: number, g: number, b: number): Rgb {
	return { r, g, b };
}
