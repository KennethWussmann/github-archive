import { Job } from "./job";
import { type StarredJobDefinition } from "./schema";

export class StarredJob extends Job<StarredJobDefinition> {
  run = async () => {
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
    this.logger.info("Finished archiving starred repos");
  };
}
