import type { NewsSource } from '@fa/contracts';
import { UpstreamError } from '../errors.js';

const TIMEOUT_MS = 5000;

export async function getJson(source: NewsSource, url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    throw new UpstreamError(source, `Request failed: ${(err as Error).message}`, undefined, url);
  }

  if (!response.ok) {
    throw new UpstreamError(source, `HTTP ${response.status}`, response.status, url);
  }
  return response.json();
}
