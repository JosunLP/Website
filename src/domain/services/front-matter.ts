/**
 * Strict front-matter parser for the documented blog authoring contract.
 *
 * This deliberately implements only the YAML subset the contract uses —
 * scalar strings (optionally quoted), booleans, and block lists of
 * strings — instead of pulling in a full YAML dependency. Anything
 * outside the subset is a parse error, which is the desired behavior for
 * untrusted uploaded content.
 */

export interface FrontMatterResult {
	readonly data: Record<string, unknown>;
	/** Markdown body after the closing delimiter. */
	readonly body: string;
}

const DELIMITER = /^---\r?\n/;
const KEY_LINE = /^([A-Za-z][A-Za-z0-9_]*):(?:\s+(.*))?$/;
const LIST_ITEM = /^\s+-\s+(.*)$/;

function parseScalar(rawValue: string): string | boolean {
	const value = rawValue.trim();
	if (value === 'true') return true;
	if (value === 'false') return false;
	if (
		(value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
		(value.startsWith("'") && value.endsWith("'") && value.length >= 2)
	) {
		return value.slice(1, -1);
	}
	return value;
}

/**
 * Splits a Markdown document into front matter and body.
 *
 * @throws Error when the document has no front matter block or a line
 * cannot be parsed with the supported subset.
 */
export function parseFrontMatter(document: string): FrontMatterResult {
	if (!DELIMITER.test(document)) {
		throw new Error('document does not start with a front matter block');
	}
	const withoutOpening = document.replace(DELIMITER, '');
	const closingIndex = withoutOpening.search(/^---\s*$/m);
	if (closingIndex === -1) {
		throw new Error('front matter block is not closed with "---"');
	}
	const block = withoutOpening.slice(0, closingIndex);
	const body = withoutOpening.slice(closingIndex).replace(/^---\s*\r?\n?/, '');

	const data: Record<string, unknown> = {};
	let currentListKey: string | null = null;

	for (const line of block.split(/\r?\n/)) {
		if (line.trim() === '' || line.trimStart().startsWith('#')) {
			continue;
		}
		const listMatch = LIST_ITEM.exec(line);
		if (listMatch !== null) {
			if (currentListKey === null) {
				throw new Error(`list item outside of a list: "${line.trim()}"`);
			}
			const list = data[currentListKey];
			if (!Array.isArray(list)) {
				throw new Error(`"${currentListKey}" is not a list`);
			}
			const item = parseScalar(listMatch[1] ?? '');
			if (typeof item !== 'string') {
				throw new Error(`"${currentListKey}" list items must be strings`);
			}
			list.push(item);
			continue;
		}
		const keyMatch = KEY_LINE.exec(line);
		if (keyMatch === null) {
			throw new Error(`unsupported front matter line: "${line.trim()}"`);
		}
		const key = keyMatch[1] ?? '';
		const rawValue = keyMatch[2];
		if (rawValue === undefined || rawValue.trim() === '') {
			// A key without a value opens a block list.
			data[key] = [];
			currentListKey = key;
		} else {
			data[key] = parseScalar(rawValue);
			currentListKey = null;
		}
	}
	return { data, body };
}
