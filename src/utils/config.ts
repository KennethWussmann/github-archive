import { config as loadConfig } from "dotenv";

loadConfig();

import { z } from "zod";

const giteaMigrationItem = z.union([
  z.literal("wiki"),
  z.literal("labels"),
  z.literal("issues"),
  z.literal("pull-requests"),
  z.literal("releases"),
  z.literal("milestones"),
]);

export type GiteaMigrationItem = z.infer<typeof giteaMigrationItem>;

export const config = z
  .object({
    GITHUB_USER: z.string(),
    GITHUB_PAT: z
      .string()
      .transform((val) => val.split(","))
      .optional(),
    GITEA_ORG: z.string().optional(),
    GITEA_USER: z.string().optional(),
    GITEA_API_KEY: z.string(),
    GITEA_URL: z.string(),
    GITEA_CREATE_PUBLIC: z
      .string()
      .default("false")
      .transform((val) => val.toLowerCase() === "true"),
    GITEA_MIGRATION_ITEMS: z
      .string()
      .default("wiki")
      .transform((val) =>
        val.split(",").map((item) => giteaMigrationItem.parse(item)),
      )
      .nullable(),
    GITEA_MIRROR: z
      .string()
      .default("true")
      .transform((val) => val.toLowerCase() === "true"),
    GITEA_MIRROR_INTERVAL: z.string().default("24h"),
    CRON_SCHEDULE: z.string().default("0 0 * * *"),
  })
  .parse(process.env);
