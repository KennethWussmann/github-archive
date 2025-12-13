import { writeFile } from "fs/promises";
import { join } from "path";
import { jobsFile } from "../src/jobs/schema";
import { z } from "zod";

const generate = async () => {
  const jsonSchema = z.toJSONSchema(jobsFile);
  await writeFile(
    join(__dirname, `../schemas/jobs.schema.json`),
    JSON.stringify(jsonSchema, null, 2),
  );
};

void generate();
