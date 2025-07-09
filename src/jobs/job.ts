import { schedule } from "node-cron";
import type { Logger } from "winston";
import type {
  GiteaApiService,
  GiteaApiServiceFactory,
} from "../api/gitea/giteaApiService";
import type {
  GitHubApiService,
  GitHubApiServiceFactory,
} from "../api/github/githubApiService";
import type { GiteaMirrorSettings, JobDefinition } from "./schema";

export abstract class Job<T extends JobDefinition> {
  protected readonly githubApiService: GitHubApiService;
  protected readonly giteaApiService: GiteaApiService;
  protected importInProgress = false;
  protected task = schedule(this.definition.schedule ?? "0 0 * * *", () => {
    void this.run();
  });

  constructor(
    protected readonly logger: Logger,
    readonly githubApiServiceFactory: GitHubApiServiceFactory,
    readonly giteaApiServiceFactory: GiteaApiServiceFactory,
    public readonly definition: T,
    protected readonly mirrorSettings: GiteaMirrorSettings,
    protected readonly githubAccessTokens: string[],
  ) {
    this.githubApiService = githubApiServiceFactory(
      this.logger.child({
        job: this.definition.name,
        name: "GitHubApiService",
      }),
      this.githubAccessTokens[0],
      this.definition.githubSource.user,
    );
    this.giteaApiService = giteaApiServiceFactory(
      this.logger.child({
        job: this.definition.name,
        name: "GiteaApiService",
      }),
      this.mirrorSettings,
      this.githubAccessTokens,
    );
  }

  start = () => {
    this.logger.info("Starting archival schedule", {
      cronSchedule: this.definition.schedule,
    });
    this.task.start();
  };

  stop = () => {
    this.logger.info("Stopping archival schedule");
    this.task.stop();
  };

  abstract run: () => Promise<void>;
}
