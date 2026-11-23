import type { NewsItem, NewsSource } from '@fa/contracts';

export interface PageRequest {
  limit: number;
  offset: number;
  search?: string | undefined;
}

export interface AdapterPage {
  items: NewsItem[];
  hasMore: boolean;
}

export interface NewsAdapter {
  readonly source: NewsSource;
  fetchPage(req: PageRequest): Promise<AdapterPage>;
  fetchById(nativeId: string): Promise<NewsItem | null>;
}
