import { z } from "zod";

const repo = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  clone_url: z.string(),
  description: z.string().nullable(),
});

export const starredResponse = z.array(repo);

export type GitHubRepo = z.infer<typeof repo>;
