import type { Logger } from 'graphql-yoga';
import type { NewsSource } from '@fa/contracts';
import type { NewsAdapter } from './adapters/news-adapter.js';
import { createHackerNews, devTo, spaceflight } from './adapters/index.js';
import { TtlCache } from './cache.js';
import { AppError } from './errors.js';
import { logUpstreamError } from './logger.js';

export interface SourceStatus {
  source: NewsSource;
  healthy: boolean;
  latencyMs: number | null;
  lastError: string | null;
  cachedAt: string;
}

const statusCache = new TtlCache<NewsSource, SourceStatus>(30_000);

export function checkSources(log: Logger): Promise<SourceStatus[]> {
  const adapters: NewsAdapter[] = [createHackerNews(), spaceflight, devTo];
  return Promise.all(adapters.map((a) => statusCache.get(a.source, () => check(a, log))));
}

async function check(adapter: NewsAdapter, log: Logger): Promise<SourceStatus> {
  const start = performance.now();
  try {
    await adapter.fetchPage({ limit: 1, offset: 0 });
    return {
      source: adapter.source,
      healthy: true,
      latencyMs: Math.round(performance.now() - start),
      lastError: null,
      cachedAt: new Date().toISOString(),
    };
  } catch (err) {
    logUpstreamError(log, adapter.source, err);
    return {
      source: adapter.source,
      healthy: false,
      latencyMs: null,
      lastError: err instanceof AppError ? err.message : 'Unknown error',
      cachedAt: new Date().toISOString(),
    };
  }
}
