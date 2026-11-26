/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "fragment NewsItemFields on NewsItem {\n  id\n  source\n  title\n  url\n  summary\n  imageUrl\n  publishedAt\n  score\n  commentsCount\n  readTimeMinutes\n  tags\n  author {\n    name\n    profileUrl\n  }\n}\n\nquery Feed($filter: FeedFilter, $first: Int, $after: String) {\n  feed(filter: $filter, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        ...NewsItemFields\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": typeof types.NewsItemFieldsFragmentDoc,
};
const documents: Documents = {
    "fragment NewsItemFields on NewsItem {\n  id\n  source\n  title\n  url\n  summary\n  imageUrl\n  publishedAt\n  score\n  commentsCount\n  readTimeMinutes\n  tags\n  author {\n    name\n    profileUrl\n  }\n}\n\nquery Feed($filter: FeedFilter, $first: Int, $after: String) {\n  feed(filter: $filter, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        ...NewsItemFields\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}": types.NewsItemFieldsFragmentDoc,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "fragment NewsItemFields on NewsItem {\n  id\n  source\n  title\n  url\n  summary\n  imageUrl\n  publishedAt\n  score\n  commentsCount\n  readTimeMinutes\n  tags\n  author {\n    name\n    profileUrl\n  }\n}\n\nquery Feed($filter: FeedFilter, $first: Int, $after: String) {\n  feed(filter: $filter, first: $first, after: $after) {\n    edges {\n      cursor\n      node {\n        ...NewsItemFields\n      }\n    }\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n  }\n}"): typeof import('./graphql').NewsItemFieldsFragmentDoc;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}
