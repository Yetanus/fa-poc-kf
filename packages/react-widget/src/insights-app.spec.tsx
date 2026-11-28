import type { NewsItem } from '@fa/contracts';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { HostProps, type InsightsProps } from './host-props';
import { InsightsApp } from './insights-app';

function newsItem(id: string, source: NewsItem['source'], tags: string[]): NewsItem {
  return {
    id,
    source,
    title: id,
    url: null,
    summary: null,
    imageUrl: null,
    publishedAt: '2026-11-28T12:00:00Z',
    authorName: null,
    score: null,
    commentsCount: null,
    readTimeMinutes: null,
    tags,
  };
}

const items = [
  newsItem('HACKER_NEWS:1', 'HACKER_NEWS', ['space']),
  newsItem('SPACEFLIGHT:2', 'SPACEFLIGHT', ['space']),
  newsItem('DEV_TO:3', 'DEV_TO', ['space', 'react']),
  newsItem('DEV_TO:4', 'DEV_TO', ['react']),
];

function renderInsights(props: Partial<InsightsProps> = {}) {
  const host = new HostProps<InsightsProps>({ items, activeTags: [], theme: 'light', ...props });
  const element = document.createElement('div');
  render(<InsightsApp host={host} element={element} />);
  return { host, element };
}

describe('InsightsApp', () => {
  afterEach(cleanup);

  it('renders sources, tags and the lazy timeline', async () => {
    renderInsights();

    const sources = screen.getByRole('region', { name: 'Źródła' });
    expect(
      within(sources)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['Hacker News1 (25%)', 'Spaceflight News1 (25%)', 'Dev.to2 (50%)']);
    expect(screen.getByRole('region', { name: 'Najpopularniejsze tagi' })).toBeTruthy();
    expect(
      await screen.findByRole('img', { name: /Liczba wiadomości w kolejnych dniach/ }),
    ).toBeTruthy();
  });

  it('gives tag buttons readable names and pressed state', () => {
    renderInsights({ activeTags: ['react'] });

    expect(
      screen
        .getByRole('button', { name: /^#space ?, wiadomości: 3$/ })
        .getAttribute('aria-pressed'),
    ).toBe('false');
    expect(
      screen
        .getByRole('button', { name: /^#react ?, wiadomości: 2$/ })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('sends fa-insights-tag-toggle when a tag is clicked', () => {
    const { element } = renderInsights();
    const toggled: string[] = [];
    element.addEventListener('fa-insights-tag-toggle', (event) => toggled.push(event.detail.tag));

    fireEvent.click(screen.getByRole('button', { name: /#react/ }));

    expect(toggled).toEqual(['react']);
  });

  it('updates when the host sets new props', () => {
    const { host } = renderInsights();

    act(() => host.set({ activeTags: ['space'] }));

    expect(screen.getByRole('button', { name: /#space/, pressed: true })).toBeTruthy();
  });
});
