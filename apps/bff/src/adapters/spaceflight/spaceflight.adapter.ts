import createClient from 'openapi-fetch';
import type { NewsItem } from '@fa/contracts';
import type { paths } from '../../generated/spaceflight.js';
import type { AdapterPage, NewsAdapter, PageRequest } from '../news-adapter.js';
import { UpstreamError } from '../../errors.js';
import { articleListSchema, articleSchema, type Article } from './spaceflight.schema.js';

const TIMEOUT_MS = 5000;

export class SpaceflightAdapter implements NewsAdapter {
  readonly source = 'SPACEFLIGHT' as const;
  private readonly client;

  constructor(baseUrl: string) {
    this.client = createClient<paths>({
      baseUrl,
      fetch: (request) =>
        fetch(request).catch((err: Error) => {
          throw new UpstreamError(
            this.source,
            `Request failed: ${err.message}`,
            undefined,
            request.url,
          );
        }),
    });
  }

  async fetchPage({ limit, offset, search }: PageRequest): Promise<AdapterPage> {
    const { data, response } = await this.client.GET('/v4/articles/', {
      params: {
        query: { limit, offset, ordering: ['-published_at'], ...(search ? { search } : {}) },
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok || !data) {
      throw new UpstreamError(
        this.source,
        `HTTP ${response.status}`,
        response.status,
        response.url,
      );
    }

    const parsed = articleListSchema.safeParse(data);
    if (!parsed.success) {
      throw new UpstreamError(this.source, `Unexpected response: ${parsed.error.message}`);
    }

    return {
      items: parsed.data.results.map(toNewsItem),
      hasMore: parsed.data.next !== null,
    };
  }

  async fetchById(nativeId: string): Promise<NewsItem | null> {
    const { data, response } = await this.client.GET('/v4/articles/{id}/', {
      params: { path: { id: Number(nativeId) } },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (response.status === 404) return null;
    if (!data) {
      throw new UpstreamError(
        this.source,
        `HTTP ${response.status}`,
        response.status,
        response.url,
      );
    }

    const parsed = articleSchema.safeParse(data);
    if (!parsed.success) {
      throw new UpstreamError(this.source, `Unexpected response: ${parsed.error.message}`);
    }
    return toNewsItem(parsed.data);
  }
}

function toNewsItem(article: Article): NewsItem {
  const providers = [...article.launches, ...article.events].map((x) => x.provider.toLowerCase());

  return {
    id: `SPACEFLIGHT:${article.id}`,
    source: 'SPACEFLIGHT',
    title: article.title,
    url: article.url,
    summary: article.summary || null,
    imageUrl: article.image_url || null,
    publishedAt: new Date(article.published_at).toISOString(),
    authorName: article.authors[0]?.name ?? article.news_site,
    score: null,
    commentsCount: null,
    readTimeMinutes: null,
    tags: [...new Set([article.news_site.toLowerCase(), ...providers])],
  };
}
