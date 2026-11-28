export function articleRoute(id: string): string[] {
  const separator = id.indexOf(':');
  return ['/article', id.slice(0, separator), id.slice(separator + 1)];
}
