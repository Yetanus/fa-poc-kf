import { createContext, useContext } from 'react';
import type { NewsStats } from './news-stats';

export const InsightsContext = createContext<NewsStats | null>(null);

export function useInsightsStats(): NewsStats {
  const stats = useContext(InsightsContext);
  if (!stats) {
    throw new Error('useInsightsStats must be used inside InsightsContext');
  }
  return stats;
}
