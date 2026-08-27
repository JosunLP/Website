import { toFrontMatter, type BlogPost } from '@/domain/models/blog';
import { parseFrontMatter } from './front-matter';
import type { FetchLike } from './blog-manifest-service';

/**
 * Fetches and parses a single Markdown article. Parsing and validation
 * errors surface as typed failures so the UI can show accessible error
 * states instead of breaking.
 */
export class MarkdownArticleService {
	constructor(private readonly fetchFn: FetchLike) {}

	/**
	 * Loads a post from its manifest `path`.
	 *
	 * @throws Error on network failure, malformed front matter, or
	 * validation errors — callers map this to an error state.
	 */
	async load(path: string): Promise<BlogPost> {
		const response = await this.fetchFn(path);
		if (!response.ok) {
			throw new Error(
				`article request failed with status ${String(response.status)}`,
			);
		}
		const source = await response.text();
		return MarkdownArticleService.parse(source);
	}

	/** Parses a raw Markdown document into a validated {@link BlogPost}. */
	static parse(source: string): BlogPost {
		const { data, body } = parseFrontMatter(source);
		const meta = toFrontMatter(data);
		return { meta, markdown: body };
	}
}
