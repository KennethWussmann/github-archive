import { z } from "zod";

const repo = z.object({
  name: z.string(),
});

export const repoListResponse = z.array(repo);

export type GiteaRepo = z.infer<typeof repo>;

const createRepoMirrorRequest = z.object({
  auth_token: z.string().nullable(),
  repo_owner: z.string(),
  repo_name: z.string(),
  clone_addr: z.string(),
  description: z.string().nullable(),
  mirror: z.literal(true),
  mirror_interval: z.string(),
  private: z.boolean(),
  service: z.literal("github"),
  issues: z.boolean(),
  labels: z.boolean(),
  milestones: z.boolean(),
  releases: z.boolean(),
  pull_requests: z.boolean(),
  wiki: z.boolean(),
});

export type CreateRepoMirrorRequest = z.infer<typeof createRepoMirrorRequest>;
