import { config } from '../config.js';
import { DevToAdapter } from './dev-to/dev-to.adapter.js';
import { HackerNewsAdapter } from './hacker-news/hacker-news.adapter.js';
import { SpaceflightAdapter } from './spaceflight/spaceflight.adapter.js';

export const spaceflight = new SpaceflightAdapter(config.SPACEFLIGHT_API_URL);
export const devTo = new DevToAdapter(config.DEV_TO_API_URL);

export function createHackerNews() {
  return new HackerNewsAdapter(config.HACKER_NEWS_API_URL, config.HACKER_NEWS_SEARCH_URL);
}
