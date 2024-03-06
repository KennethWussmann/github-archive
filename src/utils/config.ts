import { config as loadConfig } from "dotenv";

loadConfig();

import { z } from "zod";

export const config = z
  .object({
    JOBS_FILE_PATH: z.string().default("./jobs.yaml"),
  })
  .parse(process.env);
