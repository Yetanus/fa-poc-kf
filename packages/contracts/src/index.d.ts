export type NewsSource = 'HACKER_NEWS' | 'SPACEFLIGHT' | 'DEV_TO';

export interface NewsItem {
  id: string;
  source: NewsSource;
  title: string;
  url: string | null;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: string;
  authorName: string | null;
  score: number | null;
  commentsCount: number | null;
  readTimeMinutes: number | null;
  tags: readonly string[];
}

export type TickerItem = Pick<NewsItem, 'id' | 'source' | 'title' | 'publishedAt'>;

export interface TickerSelectDetail {
  id: string;
}

export interface InsightsTagToggleDetail {
  tag: string;
}

export interface FaNewsTickerElement extends HTMLElement {
  items: TickerItem[];
  speed: number;
  paused: boolean;
}

export interface FaNewsInsightsElement extends HTMLElement {
  items: NewsItem[];
  activeTags: string[];
  theme: 'light' | 'dark';
}

declare global {
  interface HTMLElementTagNameMap {
    'fa-news-ticker': FaNewsTickerElement;
    'fa-news-insights': FaNewsInsightsElement;
  }

  interface HTMLElementEventMap {
    'fa-ticker-select': CustomEvent<TickerSelectDetail>;
    'fa-insights-tag-toggle': CustomEvent<InsightsTagToggleDetail>;
  }
}
