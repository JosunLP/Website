import { Window } from 'happy-dom';

/**
 * Installs the DOM globals bQuery's sanitizer needs when the render
 * pipeline runs in Node (prerender, generators, tests are covered by
 * Vitest's happy-dom environment instead).
 */
export function installDomGlobals(): void {
	if ('document' in globalThis) {
		return;
	}
	const window = new Window();
	const globals = globalThis as Record<string, unknown>;
	for (const key of [
		'document',
		'window',
		'Node',
		'Element',
		'HTMLElement',
		'HTMLTemplateElement',
		'DOMParser',
		'NodeFilter',
		'customElements',
		'CustomEvent',
		'MutationObserver',
		'requestAnimationFrame',
		'matchMedia',
	] as const) {
		// Never clobber globals Node already provides (e.g. `navigator`).
		if (!(key in globalThis)) {
			globals[key] = (window as unknown as Record<string, unknown>)[key];
		}
	}
}
