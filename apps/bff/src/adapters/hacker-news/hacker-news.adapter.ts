import DataLoader from 'dataloader';
import type { NewsItem } from '@fa/contracts';
import type { AdapterPage, NewsAdapter, PageRequest } from '../news-adapter.js';
import { getJson } from '../http.js';
import { UpstreamError } from '../../errors.js';
import {
  hnItemSchema,
  hnUserSchema,
  searchResponseSchema,
  storyIdsSchema,
  type HnItem,
  type HnUser,
} from './hacker-news.schema.js';

export class HackerNewsAdapter implements NewsAdapter {
  readonly source = 'HACKER_NEWS' as const;

  private readonly items = new DataLoader<number, HnItem | null>((ids) =>
    Promise.all(ids.map((id) => this.fetchItem(id).catch((err: Error) => err))),
  );

  private readonly users = new DataLoader<string, HnUser | null>((ids) =>
    Promise.all(ids.map((id) => this.fetchUser(id).catch((err: Error) => err))),
  );

  constructor(
    private readonly apiUrl: string,
    private readonly searchUrl: string,
  ) {}

  async fetchPage({ limit, offset, search }: PageRequest): Promise<AdapterPage> {
    if (search) {
      return this.search(search, limit, offset);
    }

    const ids = storyIdsSchema.parse(await getJson(this.source, `${this.apiUrl}/topstories.json`));
    const pageIds = ids.slice(offset, offset + limit);

    const results = await Promise.allSettled(pageIds.map((id) => this.items.load(id)));
    const items = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value)
      .filter((item) => item !== null)
      .filter((item) => item.type === 'story' && !item.dead && !item.deleted)
      .map(toNewsItem);

    return { items, hasMore: offset + limit < ids.length };
  }

  async fetchById(nativeId: string): Promise<NewsItem | null> {
    const item = await this.items.load(Number(nativeId));
    if (!item || item.dead || item.deleted) return null;
    return toNewsItem(item);
  }

  loadUser(id: string): Promise<HnUser | null> {
    return this.users.load(id);
  }

  private async fetchItem(id: number): Promise<HnItem | null> {
    const data = await getJson(this.source, `${this.apiUrl}/item/${id}.json`);
    if (data === null) return null;
    const parsed = hnItemSchema.safeParse(data);
    if (!parsed.success) {
      throw new UpstreamError(this.source, `Unexpected item ${id}: ${parsed.error.message}`);
    }
    return parsed.data;
  }

  private async fetchUser(id: string): Promise<HnUser | null> {
    const data = await getJson(this.source, `${this.apiUrl}/user/${encodeURIComponent(id)}.json`);
    if (data === null) return null;
    return hnUserSchema.parse(data);
  }

  private async search(query: string, limit: number, offset: number): Promise<AdapterPage> {
    const page = Math.floor(offset / limit);
    const url = `${this.searchUrl}/search_by_date?tags=story&query=${encodeURIComponent(query)}&hitsPerPage=${limit}&page=${page}`;
    const data = searchResponseSchema.parse(await getJson(this.source, url));

    const items: NewsItem[] = data.hits
      .filter((hit) => hit.title)
      .map((hit) => ({
        id: `HACKER_NEWS:${hit.objectID}`,
        source: 'HACKER_NEWS',
        title: hit.title ?? '',
        url: hit.url ?? null,
        summary: hit.story_text ? htmlToText(hit.story_text) : null,
        imageUrl: null,
        publishedAt: new Date(hit.created_at).toISOString(),
        authorName: hit.author,
        score: hit.points,
        commentsCount: hit.num_comments,
        readTimeMinutes: null,
        tags: hit.url ? [domainOf(hit.url)] : [],
      }));

    return { items, hasMore: data.page + 1 < data.nbPages };
  }
}

function toNewsItem(item: HnItem): NewsItem {
  return {
    id: `HACKER_NEWS:${item.id}`,
    source: 'HACKER_NEWS',
    title: item.title ?? '',
    url: item.url ?? null,
    summary: item.text ? htmlToText(item.text) : null,
    imageUrl: null,
    publishedAt: new Date(item.time).toISOString(),
    authorName: item.by ?? null,
    score: item.score ?? null,
    commentsCount: item.descendants ?? 0,
    readTimeMinutes: null,
    tags: item.url ? [domainOf(item.url)] : [],
  };
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'news.ycombinator.com';
  }
}

function htmlToText(html: string): string {
  const text = html
    .replace(/<p>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/g, '/')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .trim();
  return text.length > 300 ? `${text.slice(0, 300)}...` : text;
}
