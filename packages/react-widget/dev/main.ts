import type { NewsItem } from '@fa/contracts';
import { FaNewsInsights } from '../src';

function newsItem(id: string, source: NewsItem['source'], title: string, tags: string[]): NewsItem {
  return {
    id,
    source,
    title,
    url: null,
    summary: null,
    imageUrl: null,
    publishedAt: new Date(Date.now() - Number(id.split(':')[1]) * 3_600_000).toISOString(),
    authorName: null,
    score: null,
    commentsCount: null,
    readTimeMinutes: null,
    tags,
  };
}

const items: NewsItem[] = [
  newsItem('SPACEFLIGHT:1', 'SPACEFLIGHT', 'Starship lands on the Moon', ['space', 'spacex']),
  newsItem('HACKER_NEWS:2', 'HACKER_NEWS', 'Show HN: A tiny Web Component framework', [
    'github.com',
  ]),
  newsItem('DEV_TO:3', 'DEV_TO', 'Signals in Angular 22 – a practical guide', [
    'angular',
    'webdev',
  ]),
  newsItem('SPACEFLIGHT:4', 'SPACEFLIGHT', 'ESA confirms new Mars sample return plan', [
    'space',
    'esa',
  ]),
  newsItem('HACKER_NEWS:5', 'HACKER_NEWS', 'Ask HN: What are you working on?', []),
  newsItem('DEV_TO:6', 'DEV_TO', 'React 19 custom elements in practice', ['react', 'webdev']),
];

const logElement = document.querySelector('#log');
const insights = document.querySelector('fa-news-insights');

function log(message: string): void {
  if (logElement) {
    logElement.textContent += `${message}\n`;
  }
}

if (insights) {
  insights.items = items;

  document.querySelector('#add')?.addEventListener('click', () => {
    const id = insights.items.length + 1;
    insights.items = [
      newsItem(`DEV_TO:${id}`, 'DEV_TO', `Nowa wiadomość ${id}`, ['webdev']),
      ...insights.items,
    ];
    log(`items: ${insights.items.length}`);
  });

  document.querySelector('#tag')?.addEventListener('click', () => {
    insights.activeTags = insights.activeTags.includes('space')
      ? insights.activeTags.filter((tag) => tag !== 'space')
      : [...insights.activeTags, 'space'];
    log(`activeTags: [${insights.activeTags.join(', ')}]`);
  });

  document.querySelector('#theme')?.addEventListener('click', () => {
    insights.theme = insights.theme === 'dark' ? 'light' : 'dark';
    log(`theme: ${insights.theme}`);
  });

  document.querySelector('#invalid')?.addEventListener('click', () => {
    const mixed: unknown[] = [...items, { id: 7, title: 'bez źródła' }, null, 'tekst'];
    if (insights instanceof FaNewsInsights) {
      insights.items = mixed;
    }
    log(`items: przekazano ${mixed.length}, wyświetlono ${insights.items.length}`);
  });

  document.querySelector('#toggle')?.addEventListener('click', () => {
    if (insights.isConnected) {
      insights.remove();
      log('odłączono');
    } else {
      document.querySelector('#slot')?.append(insights);
      log('podłączono');
    }
  });
}
