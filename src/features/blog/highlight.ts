import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import rust from 'highlight.js/lib/languages/rust';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';
import { escape } from '@/utils/html';

/**
 * Code highlighting for blog articles, restricted to the languages the
 * blog actually covers to keep the bundle small. highlight.js is only
 * loaded by the blog entry chunk, never on the critical path.
 */

let registered = false;

function ensureRegistered(): void {
	if (registered) {
		return;
	}
	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('markdown', markdown);
	hljs.registerLanguage('rust', rust);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('yaml', yaml);
	hljs.registerAliases(['ts'], { languageName: 'typescript' });
	hljs.registerAliases(['js'], { languageName: 'javascript' });
	hljs.registerAliases(['sh', 'shell'], { languageName: 'bash' });
	hljs.registerAliases(['html'], { languageName: 'xml' });
	hljs.registerAliases(['yml'], { languageName: 'yaml' });
	registered = true;
}

/** Highlights code; falls back to escaped plain text for unknown languages. */
export function highlightCode(code: string, language: string): string {
	ensureRegistered();
	if (!hljs.getLanguage(language)) {
		return escape(code);
	}
	return hljs.highlight(code, { language }).value;
}
