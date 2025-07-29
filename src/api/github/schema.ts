import { z } from "zod";

export const repoTypeFilter = z.union([
  z.literal("all"),
  z.literal("owner"),
  z.literal("public"),
  z.literal("private"),
  z.literal("member"),
]);
export const repoVisibility = z.union([z.literal("public"), z.literal("private")]);
const repo = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  clone_url: z.string(),
  description: z.string().nullable(),
  visibility: repoVisibility,
});

export const repoListResponse = z.array(repo);

export type GitHubRepo = z.infer<typeof repo>;

export type RepoTypeFilter = z.infer<typeof repoTypeFilter>;
export type RepoVisibility = z.infer<typeof repoVisibility>;
