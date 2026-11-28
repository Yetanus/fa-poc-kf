import type { InsightsTagToggleDetail } from '@fa/contracts';
import { Suspense, lazy, useCallback } from 'react';
import type { HostProps, InsightsProps } from './host-props';
import { InsightsContext } from './insights-context';
import { SourceBreakdown } from './source-breakdown';
import { TopTags } from './top-tags';
import { useHostProps } from './use-host-props';
import { useNewsStats } from './use-news-stats';

const Timeline = lazy(() => import('./timeline'));

interface InsightsAppProps {
  host: HostProps<InsightsProps>;
  element: HTMLElement;
}

export function InsightsApp({ host, element }: InsightsAppProps) {
  const { items, activeTags, theme } = useHostProps(host);
  const stats = useNewsStats(items);

  // stable callback, a new one on every render would re-render all memoized tag buttons
  const toggleTag = useCallback(
    (tag: string) => {
      element.dispatchEvent(
        new CustomEvent<InsightsTagToggleDetail>('fa-insights-tag-toggle', {
          detail: { tag },
          bubbles: true,
          composed: true,
        }),
      );
    },
    [element],
  );

  return (
    <section className="insights" aria-labelledby="insights-title" data-theme={theme}>
      <h2 id="insights-title" className="insights__title">
        Statystyki
      </h2>
      {stats.total === 0 ? (
        <p className="insights__muted">Brak wiadomości do analizy.</p>
      ) : (
        <InsightsContext value={stats}>
          <p className="insights__muted">Wiadomości: {stats.total}</p>
          <SourceBreakdown />
          <TopTags tags={stats.tags} activeTags={activeTags} onToggle={toggleTag} />
          <section className="insights__block" aria-labelledby="insights-timeline">
            <h3 id="insights-timeline" className="insights__heading">
              Ostatnie 7 dni
            </h3>
            <Suspense fallback={<p className="insights__muted">Ładowanie wykresu…</p>}>
              <Timeline />
            </Suspense>
          </section>
        </InsightsContext>
      )}
    </section>
  );
}
