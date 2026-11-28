import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  SPACEFLIGHT_API_URL: z.url().default('https://api.spaceflightnewsapi.net'),
  HACKER_NEWS_API_URL: z.url().default('https://hacker-news.firebaseio.com/v0'),
  HACKER_NEWS_SEARCH_URL: z.url().default('https://hn.algolia.com/api/v1'),
  DEV_TO_API_URL: z.url().default('https://dev.to/api'),
  KEYCLOAK_ISSUER: z.url().default('http://localhost:8080/realms/fa-news'),
  KEYCLOAK_CLIENT_ID: z.string().default('fa-news-web'),
});

export const config = envSchema.parse(process.env);
