import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlClient } from '../../core/api/graphql-client';
import { ItemDocument, type ItemQuery } from '../../graphql/generated/graphql';

export type ArticleItem = NonNullable<ItemQuery['item']>;

@Injectable({ providedIn: 'root' })
export class ArticleApi {
  private readonly client = inject(GraphqlClient);

  loadItem(id: string): Observable<ArticleItem | null> {
    return this.client.query(ItemDocument, { id }).pipe(
      map(({ data, sourceErrors }) => {
        if (!data.item && sourceErrors.length > 0) {
          throw new Error(sourceErrors.map((error) => error.message).join(', '));
        }
        return data.item;
      }),
    );
  }
}
