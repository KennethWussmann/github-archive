import { rootLogger } from "./utils/logger";

const start = async () => {
  rootLogger.info("Starting GitHub archiver");
  await new Promise((resolve) => setTimeout(resolve, 100000));
};

void start();
