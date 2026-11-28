import type { NewsItem } from '@fa/contracts';
import { useMemo } from 'react';
import { computeStats, type NewsStats } from './news-stats';

export function useNewsStats(items: readonly NewsItem[]): NewsStats {
  return useMemo(() => computeStats(items), [items]);
}
