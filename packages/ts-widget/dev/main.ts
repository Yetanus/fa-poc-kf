import type { TickerItem } from '@fa/contracts';
import { FaNewsTicker } from '../src';

const items: TickerItem[] = [
  {
    id: 'SPACEFLIGHT:1',
    source: 'SPACEFLIGHT',
    title: 'Starship lands on the Moon',
    publishedAt: '2026-11-28T10:00:00Z',
  },
  {
    id: 'HACKER_NEWS:2',
    source: 'HACKER_NEWS',
    title: 'Show HN: A tiny Web Component framework',
    publishedAt: '2026-11-28T09:30:00Z',
  },
  {
    id: 'DEV_TO:3',
    source: 'DEV_TO',
    title: 'Signals in Angular 22 – a practical guide',
    publishedAt: '2026-11-28T09:00:00Z',
  },
  {
    id: 'SPACEFLIGHT:4',
    source: 'SPACEFLIGHT',
    title: 'ESA confirms new Mars sample return plan',
    publishedAt: '2026-11-28T08:45:00Z',
  },
  {
    id: 'HACKER_NEWS:5',
    source: 'HACKER_NEWS',
    title: 'Ask HN: What are you working on?',
    publishedAt: '2026-11-28T08:00:00Z',
  },
  {
    id: 'DEV_TO:6',
    source: 'DEV_TO',
    title: 'requestAnimationFrame explained with a news ticker',
    publishedAt: '2026-11-28T07:30:00Z',
  },
];

const logElement = document.querySelector('#log');
const ticker = document.querySelector('fa-news-ticker');

function log(message: string): void {
  if (logElement) {
    logElement.textContent += `${message}\n`;
  }
}

if (ticker) {
  ticker.items = items;

  ticker.addEventListener('fa-ticker-select', (event) => {
    log(`fa-ticker-select: ${event.detail.id}`);
  });

  document.querySelector<HTMLInputElement>('#speed')?.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement) {
      ticker.speed = Number(event.target.value);
    }
  });

  document.querySelector('#invalid')?.addEventListener('click', () => {
    const mixed: unknown[] = [...items, { id: 7, title: 'bez źródła' }, null, 'tekst'];
    if (ticker instanceof FaNewsTicker) {
      ticker.items = mixed;
    }
    log(`items: przekazano ${mixed.length}, wyświetlono ${ticker.items.length}`);
  });

  document.querySelector('#toggle')?.addEventListener('click', () => {
    if (ticker.isConnected) {
      ticker.remove();
      log('odłączono');
    } else {
      document.querySelector('#slot')?.append(ticker);
      log('podłączono');
    }
  });
}
