import type { NewsItem } from '@fa/contracts';
import type { AdapterPage, NewsAdapter, PageRequest } from '../news-adapter.js';
import { getJson } from '../http.js';
import { UpstreamError } from '../../errors.js';
import { devToArticleSchema, devToListSchema, type DevToArticle } from './dev-to.schema.js';

export class DevToAdapter implements NewsAdapter {
  readonly source = 'DEV_TO' as const;

  constructor(private readonly apiUrl: string) {}

  async fetchPage({ limit, offset, search }: PageRequest): Promise<AdapterPage> {
    const page = Math.floor(offset / limit) + 1;
    const url = search
      ? `${this.apiUrl}/articles?tag=${encodeURIComponent(toTag(search))}&per_page=${limit}&page=${page}`
      : `${this.apiUrl}/articles/latest?per_page=${limit}&page=${page}`;

    const parsed = devToListSchema.safeParse(await getJson(this.source, url));
    if (!parsed.success) {
      throw new UpstreamError(this.source, `Unexpected response: ${parsed.error.message}`);
    }

    return {
      items: parsed.data.map(toNewsItem),
      hasMore: parsed.data.length === limit,
    };
  }

  async fetchById(nativeId: string): Promise<NewsItem | null> {
    try {
      const data = await getJson(this.source, `${this.apiUrl}/articles/${nativeId}`);
      return toNewsItem(devToArticleSchema.parse(data));
    } catch (err) {
      if (err instanceof UpstreamError && err.status === 404) return null;
      throw err;
    }
  }
}

function toTag(search: string): string {
  return search
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function toNewsItem(article: DevToArticle): NewsItem {
  return {
    id: `DEV_TO:${article.id}`,
    source: 'DEV_TO',
    title: article.title,
    url: article.url,
    summary: article.description || null,
    imageUrl: article.cover_image,
    publishedAt: new Date(article.published_at).toISOString(),
    authorName: article.user.name,
    score: article.public_reactions_count,
    commentsCount: article.comments_count,
    readTimeMinutes: article.reading_time_minutes,
    tags: article.tag_list.map((tag) => tag.toLowerCase()),
  };
}
