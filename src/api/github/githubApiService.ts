import { type Logger } from "winston";
import {
  repoListResponse,
  type GitHubRepo,
  type RepoVisibility,
  type RepoTypeFilter,
} from "./schema";

export class GitHubApiService {
  constructor(
    private readonly logger: Logger,
    private readonly pat: string | undefined,
    private readonly user: string | undefined,
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

      const repos: GitHubRepo[] = repoListResponse.parse(await response.json());
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

  getUserRepos = async (
    visibility: RepoVisibility[] = ["private", "public"],
    type: RepoTypeFilter = "owner",
  ): Promise<GitHubRepo[]> => {
    let page = 1;
    const allRepos: GitHubRepo[] = [];
    let hasMore = true;

    while (hasMore) {
      const query = {
        page: page.toString(),
        per_page: "100",
        sort: "created",
        direction: "desc",
        type: type,
      };

      this.logger.debug("Fetching starred repos", {
        user: this.user,
        page,
      });

      const response = await fetch(
        `https://api.github.com${this.user ? `/users/${this.user}/repos` : "/user/repos"}?${new URLSearchParams(query).toString()}`,
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

        this.logger.error(`Failed to fetch repos for user ${this.user}`, {
          status: response.status,
          response: await response.text(),
        });
        break;
      }

      const repos: GitHubRepo[] = repoListResponse.parse(await response.json());
      if (repos.length > 0) {
        allRepos.push(...repos);
        page++;
      } else {
        hasMore = false;
      }
    }

    this.logger.debug("Fetched user repos", {
      count: allRepos.length,
      repos: allRepos.map((repo) => repo.full_name),
    });

    return allRepos.filter((repo) => visibility.includes(repo.visibility));
  };
}

export type GitHubApiServiceFactory = (
  logger: Logger,
  pat: string | undefined,
  user: string | undefined,
) => GitHubApiService;

export const defaultGitHubApiServiceFactory: GitHubApiServiceFactory = (
  logger,
  pat,
  user,
) => new GitHubApiService(logger, pat, user);
