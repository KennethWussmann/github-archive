import { GiteaApiService } from "./api/gitea/giteaApiService";
import { GitHubApiService } from "./api/github/githubApiService";
import { ArchivalService } from "./archivalService";
import { config } from "./utils/config";
import { createLogger } from "./utils/logger";

class ApplicationContext {
  private rootLogger = createLogger({});

  private githubApiService = new GitHubApiService(
    this.rootLogger.child({ name: "GitHubApiService" }),
    config.GITHUB_PAT?.at(0),
    config.GITHUB_USER,
  );
  private giteaApiService = new GiteaApiService(
    this.rootLogger.child({ name: "GiteaApiService" }),
    config.GITEA_URL,
    config.GITEA_API_KEY,
    config.GITEA_ORG,
    config.GITEA_USER,
    config.GITEA_CREATE_PUBLIC,
    config.GITEA_MIRROR_INTERVAL,
    config.GITHUB_PAT ?? [],
    config.GITEA_MIGRATION_ITEMS ?? [],
  );
  public archivalService = new ArchivalService(
    this.rootLogger.child({ name: "ArchivalService" }),
    this.githubApiService,
    this.giteaApiService,
    config.CRON_SCHEDULE,
  );

  constructor() {
    this.rootLogger.debug("Application context initialized", { config });
  }
}

export const defaultApplicationContext = new ApplicationContext();
