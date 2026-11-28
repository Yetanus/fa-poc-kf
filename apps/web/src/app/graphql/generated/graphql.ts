/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type FeedFilter = {
  search?: string | null | undefined;
  sources?: Array<NewsSource> | null | undefined;
  tags?: Array<string> | null | undefined;
};

export type NewsSource =
  | 'DEV_TO'
  | 'HACKER_NEWS'
  | 'SPACEFLIGHT';

export type NewsItemFieldsFragment = { id: string, source: NewsSource, title: string, url: string | null, summary: string | null, imageUrl: string | null, publishedAt: string, score: number | null, commentsCount: number | null, readTimeMinutes: number | null, tags: Array<string>, author: { name: string, profileUrl: string | null } | null };

export type FeedQueryVariables = Exact<{
  filter?: FeedFilter | null | undefined;
  first?: number | null | undefined;
  after?: string | null | undefined;
}>;


export type FeedQuery = { feed: { edges: Array<{ cursor: string, node: { id: string, source: NewsSource, title: string, url: string | null, summary: string | null, imageUrl: string | null, publishedAt: string, score: number | null, commentsCount: number | null, readTimeMinutes: number | null, tags: Array<string>, author: { name: string, profileUrl: string | null } | null } }>, pageInfo: { hasNextPage: boolean, endCursor: string | null } } };

export type ItemQueryVariables = Exact<{
  id: string | number;
}>;


export type ItemQuery = { item: { id: string, source: NewsSource, title: string, url: string | null, summary: string | null, imageUrl: string | null, publishedAt: string, score: number | null, commentsCount: number | null, readTimeMinutes: number | null, tags: Array<string>, author: { karma: number | null, name: string, profileUrl: string | null } | null } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const NewsItemFieldsFragmentDoc = new TypedDocumentString(`
    fragment NewsItemFields on NewsItem {
  id
  source
  title
  url
  summary
  imageUrl
  publishedAt
  score
  commentsCount
  readTimeMinutes
  tags
  author {
    name
    profileUrl
  }
}
    `, {"fragmentName":"NewsItemFields"}) as unknown as TypedDocumentString<NewsItemFieldsFragment, unknown>;
export const FeedDocument = new TypedDocumentString(`
    query Feed($filter: FeedFilter, $first: Int, $after: String) {
  feed(filter: $filter, first: $first, after: $after) {
    edges {
      cursor
      node {
        ...NewsItemFields
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    fragment NewsItemFields on NewsItem {
  id
  source
  title
  url
  summary
  imageUrl
  publishedAt
  score
  commentsCount
  readTimeMinutes
  tags
  author {
    name
    profileUrl
  }
}`) as unknown as TypedDocumentString<FeedQuery, FeedQueryVariables>;
export const ItemDocument = new TypedDocumentString(`
    query Item($id: ID!) {
  item(id: $id) {
    ...NewsItemFields
    author {
      karma
    }
  }
}
    fragment NewsItemFields on NewsItem {
  id
  source
  title
  url
  summary
  imageUrl
  publishedAt
  score
  commentsCount
  readTimeMinutes
  tags
  author {
    name
    profileUrl
  }
}`) as unknown as TypedDocumentString<ItemQuery, ItemQueryVariables>;