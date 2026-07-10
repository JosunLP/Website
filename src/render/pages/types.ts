import type { PageMeta } from '@/domain/services/seo';
import type { DocumentOptions } from '@/render/layout';
import type { SafeHtml } from '@/utils/html';

/** Result of rendering one page: head metadata plus main content. */
export interface RenderedPage {
	readonly meta: PageMeta;
	readonly main: SafeHtml;
	readonly options?: DocumentOptions;
}
