import { z } from 'zod';

export const articleSchema = z.object({
  id: z.number(),
  title: z.string(),
  authors: z.array(z.object({ name: z.string() })),
  url: z.string(),
  image_url: z.string().nullable(),
  news_site: z.string(),
  summary: z.string(),
  published_at: z.string(),
  launches: z.array(z.object({ provider: z.string() })),
  events: z.array(z.object({ provider: z.string() })),
});

export const articleListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  results: z.array(articleSchema),
});

export type Article = z.infer<typeof articleSchema>;
