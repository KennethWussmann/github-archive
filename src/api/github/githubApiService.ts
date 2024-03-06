import { type Logger } from "winston";
import { starredResponse, type GitHubRepo } from "./schema";

export class GitHubApiService {
  constructor(
    private readonly logger: Logger,
    private readonly pat: string | undefined,
    private readonly user: string,
  ) {}

  getStarredRepos = async (): Promise<GitHubRepo[]> => {
    let page = 1;
    const perPage = 100;
    const allRepos: GitHubRepo[] = [];
    let hasMore = true;

    while (hasMore) {
      const query = {
        per_page: perPage.toString(),
        page: page.toString(),
      };

      this.logger.debug("Fetching starred repos", {
        user: this.user,
        page,
      });

      const response = await fetch(
        `https://api.github.com/users/${this.user}/starred?${new URLSearchParams(query).toString()}`,
        {
          headers: {
            ...(this.pat ? { Authorization: `Bearer ${this.pat}` } : {}),
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          break;
        }

        this.logger.error(
          `Failed to fetch starred repos for user ${this.user}`,
          {
            status: response.status,
            response: await response.text(),
          },
        );
        break;
      }

      const repos: GitHubRepo[] = starredResponse.parse(await response.json());
      if (repos.length > 0) {
        allRepos.push(...repos);
        page++;
      } else {
        hasMore = false;
      }
    }

    this.logger.debug("Fetched starred repos", {
      count: allRepos.length,
      repos: allRepos.map((repo) => repo.full_name),
    });

    return allRepos;
  };
}

export type GitHubApiServiceFactory = (
  logger: Logger,
  pat: string | undefined,
  user: string,
) => GitHubApiService;

export const defaultGitHubApiServiceFactory: GitHubApiServiceFactory = (
  logger,
  pat,
  user,
) => new GitHubApiService(logger, pat, user);
