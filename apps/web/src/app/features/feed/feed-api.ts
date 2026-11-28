import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlClient } from '../../core/api/graphql-client';
import { FeedDocument } from '../../graphql/generated/graphql';
import type { FeedFilters, FeedPageResult } from './feed.models';

export const PAGE_SIZE = 20;

@Injectable({ providedIn: 'root' })
export class FeedApi {
  private readonly client = inject(GraphqlClient);

  loadPage(
    filters: FeedFilters,
    after: string | null,
    options: { silent?: boolean } = {},
  ): Observable<FeedPageResult> {
    return this.client
      .query(
        FeedDocument,
        {
          first: PAGE_SIZE,
          after,
          filter: {
            sources: [...filters.sources],
            search: filters.search || null,
            tags: [...filters.tags],
          },
        },
        options,
      )
      .pipe(
        map(({ data, sourceErrors }) => ({
          items: data.feed.edges.map((edge) => edge.node),
          endCursor: data.feed.pageInfo.endCursor,
          hasNextPage: data.feed.pageInfo.hasNextPage,
          sourceErrors,
        })),
      );
  }
}
