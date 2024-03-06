import { type Logger } from "winston";
import { fileExists } from "../../utils/fileUtils";
import { defaultJobFile, jobsFile, type JobFile } from "./schema";
import { readFile, writeFile } from "fs/promises";
import * as YAML from "yaml";
import { config } from "../../utils/config";

export type JobFileProvider = (logger: Logger) => Promise<JobFile> | JobFile;

export const fileSystemJobFileProvider: JobFileProvider = async (
  logger: Logger,
) => {
  const filePath = config.JOBS_FILE_PATH;
  if (!(await fileExists(filePath))) {
    logger.warn(`No jobs file found at ${filePath}. Creating default file.`);
    await writeFile(
      filePath,
      filePath.toLowerCase().endsWith(".json")
        ? JSON.stringify(defaultJobFile, null, 2)
        : YAML.stringify(defaultJobFile, null, 2),
    );
  }
  logger.debug("Parsing jobs file", { path: filePath });
  const content = await readFile(filePath, "utf-8");

  if (filePath.toLowerCase().endsWith(".json")) {
    const jobs = jobsFile.parse(JSON.parse(content));
    logger.debug("Parsed jobs file", { jobs });
    return jobs;
  } else if (
    filePath.toLowerCase().endsWith(".yaml") ||
    filePath.toLowerCase().endsWith(".yml")
  ) {
    const jobs = jobsFile.parse(YAML.parse(content));
    logger.debug("Parsed jobs file", { jobs });
    return jobs;
  } else {
    throw new Error("Unsupported job file format");
  }
};
