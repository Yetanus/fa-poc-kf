import type { NewsSource } from '@fa/contracts';
import { memo } from 'react';
import { useInsightsStats } from './insights-context';
import { SOURCE_LABELS } from './news-stats';

const SOURCE_CLASS: Record<NewsSource, string> = {
  HACKER_NEWS: 'hn',
  SPACEFLIGHT: 'spaceflight',
  DEV_TO: 'devto',
};

const percent = new Intl.NumberFormat('pl', { style: 'percent' });

export const SourceBreakdown = memo(function SourceBreakdown() {
  const stats = useInsightsStats();

  return (
    <section className="insights__block" aria-labelledby="insights-sources">
      <h3 id="insights-sources" className="insights__heading">
        Źródła
      </h3>
      <ul className="sources">
        {stats.sources.map(({ source, count }) => (
          <li key={source} className={`sources__item sources__item--${SOURCE_CLASS[source]}`}>
            <span>{SOURCE_LABELS[source]}</span>
            <span className="sources__count">
              {count} ({percent.format(count / stats.total)})
            </span>
            <span
              className="sources__bar"
              style={{ inlineSize: `${(count / stats.total) * 100}%` }}
              aria-hidden="true"
            />
          </li>
        ))}
      </ul>
    </section>
  );
});
