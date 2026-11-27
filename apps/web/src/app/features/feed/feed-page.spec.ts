import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import type { FeedItem } from './feed.models';
import { FeedPage } from './feed-page';
import { FeedActions } from './store/feed.actions';
import { FeedState, feedAdapter, initialFeedState } from './store/feed.reducer';

const items: FeedItem[] = [
  {
    id: 'SPACEFLIGHT:1',
    source: 'SPACEFLIGHT',
    title: 'Starship lands on the Moon',
    url: 'https://example.com/starship',
    summary: 'Short summary',
    imageUrl: 'https://example.com/starship.jpg',
    publishedAt: '2026-11-21T10:00:00Z',
    score: null,
    commentsCount: null,
    readTimeMinutes: null,
    tags: ['spacex'],
    author: null,
  },
  {
    id: 'HACKER_NEWS:2',
    source: 'HACKER_NEWS',
    title: 'Ask HN: What are you working on?',
    url: null,
    summary: null,
    imageUrl: null,
    publishedAt: '2026-11-20T10:00:00Z',
    score: 42,
    commentsCount: 3,
    readTimeMinutes: null,
    tags: [],
    author: { name: 'pg', profileUrl: null },
  },
];

function loaded(overrides: Partial<FeedState> = {}): FeedState {
  return feedAdapter.setAll(items, { ...initialFeedState, status: 'loaded', ...overrides });
}

describe('FeedPage', () => {
  let store: MockStore;

  function render(state: FeedState) {
    TestBed.configureTestingModule({
      imports: [FeedPage],
      providers: [provideMockStore({ initialState: { feed: state } })],
    });
    store = TestBed.inject(MockStore);
    vi.spyOn(store, 'dispatch');
    const fixture = TestBed.createComponent(FeedPage);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('asks for the feed and shows skeletons while loading', () => {
    const element = render({ ...initialFeedState, status: 'loading' });

    expect(store.dispatch).toHaveBeenCalledWith(FeedActions.opened());
    expect(element.querySelectorAll('.feed-page__skeleton')).toHaveLength(6);
    expect(element.querySelector('app-news-card')).toBeNull();
  });

  it('renders a card for every item', () => {
    const element = render(loaded());
    const titles = [...element.querySelectorAll('.news-card__title')].map((h) =>
      h.textContent?.trim(),
    );

    expect(titles[0]).toContain('Starship lands on the Moon');
    expect(titles[1]).toBe('Ask HN: What are you working on?');
    expect(element.querySelector('.news-card__title a')?.getAttribute('target')).toBe('_blank');
    expect(element.querySelector('.news-card__source')?.textContent).toBe('Spaceflight News');
    expect(element.querySelector('.feed-page__skeleton')).toBeNull();
  });

  it('shows which sources failed and retries on click', () => {
    const element = render(
      loaded({ sourceErrors: [{ source: 'DEV_TO', message: 'DEV_TO is unavailable' }] }),
    );
    const banner = element.querySelector('app-source-errors-banner');

    expect(banner?.textContent).toContain('Dev.to');
    banner?.querySelector('button')?.click();
    expect(store.dispatch).toHaveBeenCalledWith(FeedActions.retried());
  });

  it('shows empty message when there are no items', () => {
    const element = render({ ...initialFeedState, status: 'loaded' });

    expect(element.querySelector('.feed-page__empty')?.textContent).toContain('Brak wiadomości');
  });
});
