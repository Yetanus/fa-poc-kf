import { Logger } from 'graphql-yoga';
import type { NewsSource } from '@fa/contracts';
import { config } from './config.js';
import { UpstreamError } from './errors.js';

export const logger = new Logger({ level: config.LOG_LEVEL });

export function logUpstreamError(log: Logger, source: NewsSource, err: unknown) {
  if (err instanceof UpstreamError) {
    log.child({ source }).warn({ url: err.url, status: err.status }, err.message);
  } else {
    log.child({ source }).error({ err }, 'Unexpected adapter error');
  }
}
