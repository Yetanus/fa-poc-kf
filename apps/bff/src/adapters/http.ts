import type { NewsSource } from '@fa/contracts';
import { UpstreamError } from '../errors.js';

const TIMEOUT_MS = 5000;

export async function getJson(source: NewsSource, url: string): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    throw new UpstreamError(source, `Request to ${url} failed: ${(err as Error).message}`);
  }

  if (!response.ok) {
    throw new UpstreamError(
      source,
      `Request to ${url} returned ${response.status}`,
      response.status,
    );
  }
  return response.json();
}
