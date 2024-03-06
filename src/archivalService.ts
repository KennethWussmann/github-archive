import { type Logger } from "winston";
import { type GitHubApiService } from "./api/github/githubApiService";
import { schedule } from "node-cron";
import { type GiteaApiService } from "./api/gitea/giteaApiService";
export class ArchivalService {
  private importInProgress = false;
  private task = schedule(this.cronSchedule, () => {
    void this.archive();
  });

  constructor(
    private readonly logger: Logger,
    private readonly githubApiService: GitHubApiService,
    private readonly giteaApiService: GiteaApiService,
    private readonly cronSchedule: string,
  ) {}

  start = () => {
    this.logger.info("Starting archival schedule", {
      cronSchedule: this.cronSchedule,
    });
    this.task.start();
  };

  stop = () => {
    this.logger.info("Stopping archival schedule");
    this.task.stop();
  };

  archive = async () => {
    if (this.importInProgress) {
      this.logger.info("Import already in progress");
      return;
    }
    this.importInProgress = true;
    try {
      this.logger.info("Archiving starred repos");
      const starredRepos = await this.githubApiService.getStarredRepos();

      if (starredRepos.length === 0) {
        this.logger.info("No starred repos to archive");
        return;
      }

      this.logger.debug("Found starred repos", {
        count: starredRepos.length,
      });

      const giteaRepos = await this.giteaApiService.getRepos();
      this.logger.debug("Found Gitea repos", {
        count: giteaRepos.length,
      });

      const nonExistentRepos = starredRepos.filter(
        (starredRepo) =>
          !giteaRepos.some((giteaRepo) => giteaRepo.name === starredRepo.name),
      );

      this.logger.info(
        `Found ${nonExistentRepos.length} repos to archive. Beginning archival. This may take a while.`,
      );
      this.logger.debug("Repos to archive", {
        repos: nonExistentRepos,
      });

      for (const repo of nonExistentRepos) {
        this.logger.debug("Archiving repo", {
          repo: repo.full_name,
        });
        try {
          await this.giteaApiService.createRepoMirror(repo);
          this.logger.info("Archived repo", {
            repo: repo.full_name,
          });
        } catch (e) {
          this.logger.error("Failed to archive repo", {
            repo: repo.full_name,
            error: e,
          });
        }
      }
    } catch (e) {
      this.logger.error("Failed to archive starred repos", {
        error: e,
      });
    }
    this.importInProgress = false;
  };
}
