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

export class UnauthenticatedError extends AppError {
  readonly code = 'UNAUTHENTICATED';

  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'UnauthenticatedError';
  }
}

// bad or expired token -> HTTP 401, so the client knows it has to refresh it
export class InvalidTokenError extends UnauthenticatedError {
  constructor() {
    super('Invalid or expired token');
    this.name = 'InvalidTokenError';
  }

  override get extensions() {
    return {
      code: this.code,
      http: { status: 401, headers: { 'WWW-Authenticate': 'Bearer error="invalid_token"' } },
    };
  }
}

export class ForbiddenError extends AppError {
  readonly code = 'FORBIDDEN';

  constructor(role: string) {
    super(`Requires role: ${role}`);
    this.name = 'ForbiddenError';
  }
}

export class ValidationError extends AppError {
  readonly code = 'BAD_USER_INPUT';

  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
