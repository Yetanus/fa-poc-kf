import type { HostProps, InsightsProps } from './host-props';
import { useHostProps } from './use-host-props';

interface InsightsAppProps {
  host: HostProps<InsightsProps>;
}

export function InsightsApp({ host }: InsightsAppProps) {
  const { items, activeTags, theme } = useHostProps(host);

  return (
    <section className="insights" aria-labelledby="insights-title" data-theme={theme}>
      <h2 id="insights-title" className="insights__title">
        Statystyki
      </h2>
      <p className="insights__summary">Wiadomości: {items.length}</p>
      {activeTags.length > 0 && (
        <p className="insights__summary">Aktywne tagi: {activeTags.join(', ')}</p>
      )}
    </section>
  );
}
