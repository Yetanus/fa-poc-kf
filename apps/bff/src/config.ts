import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default('http://localhost:4200'),
  SPACEFLIGHT_API_URL: z.url().default('https://api.spaceflightnewsapi.net'),
});

export const config = envSchema.parse(process.env);
