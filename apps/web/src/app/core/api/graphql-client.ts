import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import type { NewsSource, TypedDocumentString } from '../../graphql/generated/graphql';
import { ApiError } from './api-error';

interface GraphqlErrorPayload {
  message: string;
  extensions?: { code?: string; source?: string };
}

interface GraphqlResponse<T> {
  data?: T | null;
  errors?: GraphqlErrorPayload[];
}

export interface SourceError {
  source: NewsSource;
  message: string;
}

export interface GraphqlResult<T> {
  data: T;
  sourceErrors: SourceError[];
}

const SOURCES = new Set<string>(['HACKER_NEWS', 'SPACEFLIGHT', 'DEV_TO'] satisfies NewsSource[]);

function isNewsSource(value: unknown): value is NewsSource {
  return typeof value === 'string' && SOURCES.has(value);
}

function toResult<T>(response: GraphqlResponse<T>): GraphqlResult<T> {
  const errors = response.errors ?? [];

  if (!response.data) {
    const first = errors[0];
    throw new ApiError('graphql', first?.message ?? 'Empty response', 200, first?.extensions?.code);
  }

  const sourceErrors: SourceError[] = [];
  for (const error of errors) {
    const source = error.extensions?.source;
    if (error.extensions?.code === 'UPSTREAM_UNAVAILABLE' && isNewsSource(source)) {
      sourceErrors.push({ source, message: error.message });
    }
  }

  return { data: response.data, sourceErrors };
}

@Injectable({ providedIn: 'root' })
export class GraphqlClient {
  private readonly http = inject(HttpClient);

  query<TResult, TVariables>(
    document: TypedDocumentString<TResult, TVariables>,
    variables?: TVariables,
  ): Observable<GraphqlResult<TResult>> {
    return this.http
      .post<GraphqlResponse<TResult>>(
        '/graphql',
        { query: document.toString(), variables },
        { timeout: 10_000 },
      )
      .pipe(map((response) => toResult(response)));
  }
}
