import type { NewsSource } from '../../graphql/generated/graphql';

export function articleRoute(item: { id: string; source: NewsSource }): string[] {
  return ['/article', item.source, item.id.slice(item.id.indexOf(':') + 1)];
}
