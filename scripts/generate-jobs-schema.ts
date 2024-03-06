import { writeFile } from "fs/promises";
import { join } from "path";
import { zodToJsonSchema } from "zod-to-json-schema";
import { jobsFile } from "../src/api/jobs/schema";

const generate = async () => {
  const jsonSchema = zodToJsonSchema(jobsFile);
  await writeFile(
    join(__dirname, `../schemas/jobs.schema.json`),
    JSON.stringify(jsonSchema, null, 2),
  );
};

void generate();
