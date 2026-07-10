/**
 * Minimal, environment-independent HTML templating used by the build-time
 * renderer. Interpolated values are escaped by default; markup that is
 * already safe must be wrapped explicitly with {@link raw}.
 *
 * This intentionally does not use DOM APIs so the same page renderers run
 * in Node (prerender) and in the browser (blog islands).
 */

const ESCAPE_RE = /[&<>"']/g;
const ESCAPE_MAP: Readonly<Record<string, string>> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};

export function escape(text: string): string {
	return text.replace(ESCAPE_RE, (char) => ESCAPE_MAP[char] ?? char);
}

/** Marker class for strings that are known-safe HTML. */
export class SafeHtml {
	constructor(readonly value: string) {}
	toString(): string {
		return this.value;
	}
}

/** Marks a string as already-safe HTML (do not use on untrusted input). */
export function raw(value: string): SafeHtml {
	return new SafeHtml(value);
}

export type TemplateValue =
	string | number | boolean | null | undefined | SafeHtml | TemplateValue[];

function renderValue(value: TemplateValue): string {
	if (value === null || value === undefined || value === false) {
		return '';
	}
	if (value instanceof SafeHtml) {
		return value.value;
	}
	if (Array.isArray(value)) {
		return value.map(renderValue).join('');
	}
	if (typeof value === 'number' || value === true) {
		return String(value);
	}
	return escape(value);
}

/**
 * Tagged template producing {@link SafeHtml}. All interpolations are
 * escaped unless they are `SafeHtml` (or arrays thereof).
 */
export function html(
	strings: TemplateStringsArray,
	...values: TemplateValue[]
): SafeHtml {
	let out = '';
	strings.forEach((chunk, index) => {
		out += chunk;
		if (index < values.length) {
			out += renderValue(values[index]);
		}
	});
	return new SafeHtml(out);
}
