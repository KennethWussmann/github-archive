import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { jobsFile } from "../src/jobs/schema";

const generate = async () => {
  const jsonSchema = zodToJsonSchema(jobsFile);
  await writeFile(
    join(__dirname, `../schemas/jobs.schema.json`),
    JSON.stringify(jsonSchema, null, 2),
  );
};

void generate();
