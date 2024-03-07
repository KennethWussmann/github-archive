import { defaultGiteaApiServiceFactory } from "./api/gitea/giteaApiService";
import { defaultGitHubApiServiceFactory } from "./api/github/githubApiService";
import { fileSystemJobFileProvider } from "./jobs/jobFileProvider";
import { JobService } from "./jobs/jobService";
import { config } from "./utils/config";
import { createLogger } from "./utils/logger";

class ApplicationContext {
  private rootLogger = createLogger({});

  public jobService = new JobService(
    this.rootLogger.child({ name: "JobService" }),
    fileSystemJobFileProvider,
    defaultGitHubApiServiceFactory,
    defaultGiteaApiServiceFactory,
  );

  constructor() {
    this.rootLogger.debug("Application context initialized", { config });
  }
}

export const defaultApplicationContext = new ApplicationContext();
