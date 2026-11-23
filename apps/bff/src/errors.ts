import type { NewsSource } from '@fa/contracts';

export abstract class AppError extends Error {
  abstract readonly code: string;

  get extensions(): Record<string, unknown> {
    return { code: this.code };
  }
}

export class UpstreamError extends AppError {
  readonly code = 'UPSTREAM_UNAVAILABLE';

  constructor(
    readonly source: NewsSource,
    message: string,
    readonly status?: number,
    readonly url?: string,
  ) {
    super(message);
    this.name = 'UpstreamError';
  }

  get publicMessage(): string {
    return `${this.source} is unavailable`;
  }

  override get extensions() {
    return { code: this.code, source: this.source };
  }
}

export class ValidationError extends AppError {
  readonly code = 'BAD_USER_INPUT';

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
