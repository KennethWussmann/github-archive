import { Job } from "./job";
import type { ReposJobDefinition } from "./schema";

export class ReposJob extends Job<ReposJobDefinition> {
  run = async () => {
    if (this.importInProgress) {
      this.logger.info("Import already in progress");
      return;
    }
    this.importInProgress = true;
    try {
      this.logger.info("Archiving user repos");
      const userRepos = await this.githubApiService.getUserRepos(
        this.definition.githubSource.filter?.visibility,
        this.definition.githubSource.filter?.type ?? "owner",
      );

      if (userRepos.length === 0) {
        this.logger.info("No repos to archive");
        return;
      }

      this.logger.debug("Found starred repos", {
        count: userRepos.length,
      });

      const giteaRepos = await this.giteaApiService.getRepos();
      this.logger.debug("Found Gitea repos", {
        count: giteaRepos.length,
      });

      const nonExistentRepos = userRepos.filter(
        (starredRepo) => !giteaRepos.some((giteaRepo) => giteaRepo.name === starredRepo.name),
      );

      if (nonExistentRepos.length === 0) {
        this.logger.info("No repos to archive");
        return;
      }

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
      this.logger.error("Failed to archive user repos", {
        error: e,
      });
    }
    this.importInProgress = false;
    this.logger.info("Finished archiving user repos");
  };
}
