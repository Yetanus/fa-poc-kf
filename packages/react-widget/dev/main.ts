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
    publishedAt: new Date(Date.now() - Number(id.split(':')[1]) * 9 * 3_600_000).toISOString(),
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
  newsItem('SPACEFLIGHT:7', 'SPACEFLIGHT', 'New Glenn second launch scheduled', ['space', 'blue']),
  newsItem('DEV_TO:8', 'DEV_TO', 'CSS container queries cheat sheet', ['css', 'webdev']),
  newsItem('HACKER_NEWS:9', 'HACKER_NEWS', 'SQLite as an application file format', ['sqlite.org']),
  newsItem('DEV_TO:10', 'DEV_TO', 'Testing custom elements with Vitest', ['testing', 'webdev']),
  newsItem('SPACEFLIGHT:11', 'SPACEFLIGHT', 'NASA picks landing site for Artemis IV', [
    'space',
    'nasa',
  ]),
  newsItem('DEV_TO:12', 'DEV_TO', 'TypeScript 7 native compiler first look', ['typescript']),
  newsItem('HACKER_NEWS:13', 'HACKER_NEWS', 'Postgres 19 released', ['postgresql.org']),
  newsItem('DEV_TO:14', 'DEV_TO', 'Accessible toggle buttons', ['a11y', 'webdev', 'react']),
  newsItem('SPACEFLIGHT:15', 'SPACEFLIGHT', 'Rocket Lab Neutron static fire', [
    'space',
    'rocketlab',
  ]),
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

  // the host owns activeTags, the widget only asks for a change
  insights.addEventListener('fa-insights-tag-toggle', (event) => {
    const { tag } = event.detail;
    insights.activeTags = insights.activeTags.includes(tag)
      ? insights.activeTags.filter((active) => active !== tag)
      : [...insights.activeTags, tag];
    log(`fa-insights-tag-toggle: ${tag} → [${insights.activeTags.join(', ')}]`);
  });

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
