import type { Logger } from "winston";
import type { GiteaApiServiceFactory } from "../api/gitea/giteaApiService";
import type { GitHubApiServiceFactory } from "../api/github/githubApiService";
import { config } from "../utils/config";
import type { Job } from "./job";
import type { JobFileProvider } from "./jobFileProvider";
import { ReposJob } from "./reposJob";
import type { GiteaMirrorSettings, JobDefinition, JobFile } from "./schema";
import { StarredJob } from "./starredJob";

export class JobService {
  private jobs: Job<JobDefinition>[] = [];

  constructor(
    private readonly logger: Logger,
    private readonly jobFileProvider: JobFileProvider,
    private readonly githubApiServiceFactory: GitHubApiServiceFactory,
    private readonly giteaApiServiceFactory: GiteaApiServiceFactory,
  ) {}

  private loadJobs = async () => {
    const jobFile = await this.jobFileProvider(this.logger);
    this.jobs = jobFile.jobs
      .filter((job) => job.active ?? true)
      .map((definition) => this.createJob(jobFile, definition));
    if (this.jobs.length === 0) {
      this.logger.warn(
        `No jobs loaded. Configure jobs in ${config.JOBS_FILE_PATH} and restart.`,
      );
      return;
    }
    this.logger.debug("Loaded jobs", { count: this.jobs.length });
  };

  public start = async () => {
    await this.loadJobs();
    if (this.jobs.length === 0) {
      this.logger.warn("No jobs to start");
      return;
    }
    this.jobs.forEach((job) => job.start());
    this.logger.info("Started all jobs");
  };

  public stop = () => {
    if (this.jobs.length === 0) {
      this.logger.warn("No jobs to stop");
      return;
    }
    this.jobs.forEach((job) => job.stop());
    this.logger.info("Stopped all jobs");
  };

  public runAllJobs = async () => {
    if (this.jobs.length === 0) {
      this.logger.warn("No jobs to run");
      return;
    }
    this.logger.info("Running all jobs");
    await Promise.all(this.jobs.map(async (job) => await job.run()));
  };

  private getMirrorSettings = (
    jobsFile: JobFile,
    definition: JobDefinition,
  ): GiteaMirrorSettings => ({
    accessToken:
      jobsFile.giteaDestination?.accessToken ??
      definition.giteaDestination?.accessToken,
    interval:
      definition.giteaDestination?.interval ??
      jobsFile.giteaDestination?.interval,
    items:
      definition.giteaDestination?.items ?? jobsFile.giteaDestination?.items,
    mirror:
      definition.giteaDestination?.mirror ?? jobsFile.giteaDestination?.mirror,
    org: definition.giteaDestination?.org ?? jobsFile.giteaDestination?.org,
    public:
      definition.giteaDestination?.public ?? jobsFile.giteaDestination?.public,
    url: definition.giteaDestination?.url ?? jobsFile.giteaDestination?.url,
    user: definition.giteaDestination?.user ?? jobsFile.giteaDestination?.user,
  });

  private getGitHubAccessTokens = (
    jobsFile: JobFile,
    definition: JobDefinition,
  ): string[] => {
    const asArray = (tokens: string | string[] | undefined) =>
      tokens ? (Array.isArray(tokens) ? tokens : [tokens]) : undefined;

    return (
      asArray(definition.githubSource.accessTokens) ??
      asArray(jobsFile.githubSource?.accessTokens) ??
      []
    );
  };

  private createJob = (jobsFile: JobFile, definition: JobDefinition) => {
    switch (definition.type) {
      case "starred":
        return new StarredJob(
          this.logger.child({ job: definition.name, name: "StarredJob" }),
          this.githubApiServiceFactory,
          this.giteaApiServiceFactory,
          definition,
          this.getMirrorSettings(jobsFile, definition),
          this.getGitHubAccessTokens(jobsFile, definition),
        );
      case "repos":
        return new ReposJob(
          this.logger.child({ job: definition.name, name: "ReposJob" }),
          this.githubApiServiceFactory,
          this.giteaApiServiceFactory,
          definition,
          this.getMirrorSettings(jobsFile, definition),
          this.getGitHubAccessTokens(jobsFile, definition),
        );
      default:
        throw new Error("Unsupported job type");
    }
  };
}
