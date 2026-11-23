import { z } from 'zod';

export const storyIdsSchema = z.array(z.number());

export const hnItemSchema = z.object({
  id: z.number(),
  type: z.string(),
  by: z.string().optional(),
  time: z.number(),
  title: z.string().optional(),
  url: z.string().optional(),
  text: z.string().optional(),
  score: z.number().optional(),
  descendants: z.number().optional(),
  dead: z.boolean().optional(),
  deleted: z.boolean().optional(),
});

export const hnUserSchema = z.object({
  id: z.string(),
  karma: z.number(),
});

export const searchResponseSchema = z.object({
  nbPages: z.number(),
  page: z.number(),
  hits: z.array(
    z.object({
      objectID: z.string(),
      title: z.string().nullable(),
      url: z.string().nullable().optional(),
      author: z.string(),
      points: z.number().nullable(),
      num_comments: z.number().nullable(),
      created_at: z.string(),
      story_text: z.string().nullable().optional(),
    }),
  ),
});

export type HnItem = z.infer<typeof hnItemSchema>;
export type HnUser = z.infer<typeof hnUserSchema>;
