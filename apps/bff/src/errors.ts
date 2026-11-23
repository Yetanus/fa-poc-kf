import type { NewsSource } from '@fa/contracts';

export class UpstreamError extends Error {
  constructor(
    readonly source: NewsSource,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'UpstreamError';
  }
}
