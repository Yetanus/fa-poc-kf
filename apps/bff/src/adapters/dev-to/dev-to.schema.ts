import { z } from 'zod';

const tagsSchema = z.union([z.array(z.string()), z.string()]).transform((value) =>
  Array.isArray(value)
    ? value
    : value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
);

export const devToArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  cover_image: z.string().nullable(),
  published_at: z.string(),
  reading_time_minutes: z.number().nullable(),
  comments_count: z.number(),
  public_reactions_count: z.number(),
  user: z.object({ name: z.string() }),
  tag_list: tagsSchema,
});

export const devToListSchema = z.array(devToArticleSchema);

export type DevToArticle = z.infer<typeof devToArticleSchema>;
