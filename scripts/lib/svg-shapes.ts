import type { Polygon } from './raster';

/**
 * Extracts flat-colour polygons from the small subset of SVG the site's
 * logo files use: nested `<g transform="matrix(...)">` groups wrapping
 * `<path>` elements whose data contains only `M`, `L` and `Z` commands.
 *
 * Deliberately not a general SVG parser — it exists so the generated
 * social card can reuse the real logo geometry instead of a hand-copied
 * duplicate, and it fails loudly on anything it does not understand.
 */

export interface SvgShape {
	/** Subpaths of one `<path>`; filled together with the even-odd rule. */
	readonly polygons: readonly Polygon[];
	/** Fill as written in the source (`white`, `rgb(r,g,b)`, `#rgb`). */
	readonly fill: string;
}

/** Affine transform in SVG `matrix(a b c d e f)` order. */
type Matrix = readonly [number, number, number, number, number, number];

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(outer: Matrix, inner: Matrix): Matrix {
	const [a1, b1, c1, d1, e1, f1] = outer;
	const [a2, b2, c2, d2, e2, f2] = inner;
	return [
		a1 * a2 + c1 * b2,
		b1 * a2 + d1 * b2,
		a1 * c2 + c1 * d2,
		b1 * c2 + d1 * d2,
		a1 * e2 + c1 * f2 + e1,
		b1 * e2 + d1 * f2 + f1,
	];
}

function parseMatrix(attribute: string | undefined): Matrix {
	if (attribute === undefined) {
		return IDENTITY;
	}
	const match = /matrix\(([^)]*)\)/.exec(attribute);
	if (match === null) {
		throw new Error(`unsupported transform: ${attribute}`);
	}
	const values = (match[1] ?? '')
		.split(/[\s,]+/)
		.filter((part) => part !== '')
		.map(Number);
	if (values.length !== 6 || values.some(Number.isNaN)) {
		throw new Error(`malformed matrix: ${attribute}`);
	}
	return values as unknown as Matrix;
}

function attribute(tag: string, name: string): string | undefined {
	const match = new RegExp(`${name}="([^"]*)"`).exec(tag);
	return match?.[1];
}

/** Splits path data into subpaths of transformed points. */
function parsePath(data: string, matrix: Matrix): Polygon[] {
	const polygons: Polygon[] = [];
	let current: number[] = [];
	const commands = data.match(/[MLZ][^MLZ]*/gi) ?? [];
	for (const command of commands) {
		const type = (command[0] ?? '').toUpperCase();
		if (type === 'Z') {
			if (current.length >= 6) {
				polygons.push(current);
			}
			current = [];
			continue;
		}
		if (!command.startsWith(type)) {
			throw new Error(`relative path commands are not supported: ${command}`);
		}
		const numbers = (
			command.slice(1).match(/-?\d*\.?\d+(?:e-?\d+)?/gi) ?? []
		).map(Number);
		for (let index = 0; index + 1 < numbers.length; index += 2) {
			const x = numbers[index] ?? 0;
			const y = numbers[index + 1] ?? 0;
			const [a, b, c, d, e, f] = matrix;
			current.push(a * x + c * y + e, b * x + d * y + f);
		}
	}
	if (current.length >= 6) {
		polygons.push(current);
	}
	return polygons;
}

export interface ParsedSvg {
	readonly viewBox: readonly [number, number, number, number];
	readonly shapes: readonly SvgShape[];
}

export function parseSvgShapes(source: string): ParsedSvg {
	const viewBoxAttribute = /viewBox="([^"]*)"/.exec(source)?.[1];
	if (viewBoxAttribute === undefined) {
		throw new Error('svg has no viewBox');
	}
	const viewBox = viewBoxAttribute.split(/[\s,]+/).map(Number);
	if (viewBox.length !== 4 || viewBox.some(Number.isNaN)) {
		throw new Error(`malformed viewBox: ${viewBoxAttribute}`);
	}

	const shapes: SvgShape[] = [];
	const stack: Matrix[] = [IDENTITY];
	for (const tag of source.match(/<\/?(?:g|path)\b[^>]*>/g) ?? []) {
		if (tag.startsWith('</g')) {
			stack.pop();
			continue;
		}
		const current = stack.at(-1) ?? IDENTITY;
		if (tag.startsWith('<g')) {
			stack.push(multiply(current, parseMatrix(attribute(tag, 'transform'))));
			continue;
		}
		const data = attribute(tag, 'd');
		if (data === undefined) {
			continue;
		}
		const style = attribute(tag, 'style') ?? '';
		const fill =
			/fill:\s*([^;"]+)/.exec(style)?.[1]?.trim() ??
			attribute(tag, 'fill') ??
			'black';
		shapes.push({
			polygons: parsePath(
				data,
				multiply(current, parseMatrix(attribute(tag, 'transform'))),
			),
			fill,
		});
	}
	return {
		viewBox: viewBox as unknown as [number, number, number, number],
		shapes,
	};
}
