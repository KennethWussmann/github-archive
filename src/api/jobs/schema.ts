import { z } from "zod";

export const giteaMigrationItem = z.union([
  z.literal("wiki"),
  z.literal("labels"),
  z.literal("issues"),
  z.literal("pull-requests"),
  z.literal("releases"),
  z.literal("milestones"),
]);

export type GiteaMigrationItem = z.infer<typeof giteaMigrationItem>;

const githubCredentials = z.object({
  accessTokens: z.array(z.string()).or(z.string()),
});

const giteaMirrorSettings = z.object({
  org: z.string().optional(),
  user: z.string().optional(),
  accessToken: z.string().optional(),
  url: z.string().optional(),
  mirror: z.boolean().default(true).optional(),
  public: z.boolean().default(false).optional(),
  items: z.array(giteaMigrationItem).default(["wiki"]).optional(),
  interval: z.string().default("24h").optional(),
});

export type GiteaMirrorSettings = z.infer<typeof giteaMirrorSettings>;

const baseJob = z.object({
  name: z.string(),
  description: z.string().optional(),
  active: z.boolean().default(true).optional(),
  githubSource: githubCredentials.optional(),
  giteaDestination: giteaMirrorSettings.optional(),
  schedule: z.string().default("0 0 * * *").optional(),
});

const starredJob = baseJob.merge(
  z.object({
    type: z.literal("starred"),
    githubSource: z.object({
      accessTokens: z.array(z.string()).or(z.string()).optional(),
      user: z.string(),
    }),
  }),
);

const job = z.discriminatedUnion("type", [starredJob]);

export type JobDefinition = z.infer<typeof job>;

export const jobsFile = z.object({
  $schema: z.string().optional(),
  githubSource: githubCredentials,
  giteaDestination: giteaMirrorSettings,
  jobs: z.array(job),
});

export type JobFile = z.infer<typeof jobsFile>;

export const defaultJobFile: JobFile = {
  githubSource: {
    accessTokens: ["fill-me"],
  },
  giteaDestination: {
    accessToken: "fill-me",
    url: "https://try.gitea.io/api/v1",
  },
  jobs: [],
};
