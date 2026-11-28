import type { InsightsTagToggleDetail } from '@fa/contracts';
import { act } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FaNewsInsights } from './fa-news-insights';

const item = {
  id: 'DEV_TO:1',
  source: 'DEV_TO',
  title: 'Signals in Angular',
  publishedAt: '2026-11-28T12:00:00Z',
  tags: ['angular'],
};

describe('fa-news-insights', () => {
  afterEach(() => document.body.replaceChildren());

  it('renders valid items in shadow DOM and unmounts on disconnect', async () => {
    const element = new FaNewsInsights();
    element.items = [item, { id: 2, title: 'no source' }, null];

    await act(async () => document.body.append(element));

    expect(element.items).toHaveLength(1);
    expect(element.shadowRoot?.querySelector('h2')?.textContent).toBe('Statystyki');

    await act(async () => element.remove());

    expect(element.shadowRoot?.querySelector('h2')).toBeNull();
  });

  it('reflects theme and sends a composed event from the host element', async () => {
    const element = new FaNewsInsights();
    element.items = [item];
    await act(async () => document.body.append(element));

    await act(async () => {
      element.theme = 'dark';
    });
    expect(element.getAttribute('theme')).toBe('dark');
    expect(element.shadowRoot?.querySelector('section')?.dataset['theme']).toBe('dark');

    const events: CustomEvent<InsightsTagToggleDetail>[] = [];
    document.body.addEventListener('fa-insights-tag-toggle', (event) => events.push(event));
    element.shadowRoot?.querySelector<HTMLButtonElement>('.tags__button')?.click();

    expect(events).toHaveLength(1);
    expect(events[0]?.detail.tag).toBe('angular');
    expect(events[0]?.target).toBe(element);
    expect(events[0]?.composed).toBe(true);
  });
});
