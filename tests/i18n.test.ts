import { describe, expect, it } from 'vitest';
import {
	DICTIONARIES,
	decideLocale,
	formatIsoDate,
	formatMessage,
} from '@/features/i18n';
import { LOCALES } from '@/domain/models/locale';

describe('decideLocale', () => {
	it('prefers a stored explicit choice', () => {
		expect(decideLocale('en', ['de-DE'])).toBe('en');
	});

	it('ignores invalid stored values', () => {
		expect(decideLocale('fr', ['en-US'])).toBe('en');
	});

	it('negotiates browser languages with region tags', () => {
		expect(decideLocale(null, ['en-GB', 'de'])).toBe('en');
		expect(decideLocale(null, ['de-CH'])).toBe('de');
	});

	it('falls back to German', () => {
		expect(decideLocale(null, ['ja', 'ko'])).toBe('de');
		expect(decideLocale(null, [])).toBe('de');
	});
});

describe('formatMessage', () => {
	it('interpolates parameters', () => {
		expect(formatMessage('Published on {date}', { date: 'X' })).toBe(
			'Published on X',
		);
	});

	it('selects plural forms by count', () => {
		expect(
			formatMessage('{count} article | {count} articles', { count: 1 }),
		).toBe('1 article');
		expect(
			formatMessage('{count} article | {count} articles', { count: 3 }),
		).toBe('3 articles');
	});

	it('leaves unknown placeholders intact', () => {
		expect(formatMessage('Hello {name}')).toBe('Hello {name}');
	});
});

describe('formatIsoDate', () => {
	it('formats per locale', () => {
		expect(formatIsoDate('2026-07-09', 'en')).toBe('July 9, 2026');
		expect(formatIsoDate('2026-07-09', 'de')).toBe('9. Juli 2026');
	});

	it('returns the input for invalid dates', () => {
		expect(formatIsoDate('not-a-date', 'en')).toBe('not-a-date');
	});
});

describe('dictionaries', () => {
	function keysOf(value: unknown, prefix = ''): string[] {
		if (typeof value !== 'object' || value === null || Array.isArray(value)) {
			return [prefix];
		}
		return Object.entries(value).flatMap(([key, child]) =>
			keysOf(child, prefix === '' ? key : `${prefix}.${key}`),
		);
	}

	it('all locales expose the same message keys', () => {
		const [first, ...rest] = LOCALES;
		const reference = keysOf(DICTIONARIES[first]).sort();
		for (const locale of rest) {
			expect(keysOf(DICTIONARIES[locale]).sort()).toEqual(reference);
		}
	});

	it('contains no empty strings', () => {
		for (const locale of LOCALES) {
			const walk = (value: unknown): void => {
				if (typeof value === 'string') {
					expect(value.trim()).not.toBe('');
				} else if (typeof value === 'object' && value !== null) {
					Object.values(value).forEach(walk);
				}
			};
			walk(DICTIONARIES[locale]);
		}
	});
});
