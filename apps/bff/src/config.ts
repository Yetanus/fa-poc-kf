import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  SPACEFLIGHT_API_URL: z.url().default('https://api.spaceflightnewsapi.net'),
  HACKER_NEWS_API_URL: z.url().default('https://hacker-news.firebaseio.com/v0'),
  HACKER_NEWS_SEARCH_URL: z.url().default('https://hn.algolia.com/api/v1'),
  DEV_TO_API_URL: z.url().default('https://dev.to/api'),
});

export const config = envSchema.parse(process.env);
