import type { NewsItem } from '@fa/contracts';

export const newsFixtures: NewsItem[] = [
  {
    id: 'HASHNODE:1',
    source: 'HASHNODE',
    title: 'Signals vs RxJS in Angular - when to use which',
    url: 'https://example.hashnode.dev/signals-vs-rxjs',
    summary: 'A practical comparison with examples from a real project.',
    imageUrl: 'https://picsum.photos/seed/angular/800/450',
    publishedAt: '2026-11-11T12:00:00Z',
    authorName: 'Anna Kowalska',
    score: null,
    commentsCount: null,
    readTimeMinutes: 7,
    tags: ['angular', 'rxjs'],
  },
];
