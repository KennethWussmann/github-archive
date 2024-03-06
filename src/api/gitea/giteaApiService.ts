import { type Logger } from "winston";
import {
  repoListResponse,
  type GiteaRepo,
  type CreateRepoMirrorRequest,
} from "./schema";
import { type GitHubRepo } from "../github/schema";
import { type GiteaMirrorSettings } from "../jobs/schema";

export class GiteaApiService {
  constructor(
    private readonly logger: Logger,
    private readonly settings: GiteaMirrorSettings,
    private readonly githubAccessTokens: string[],
  ) {}

  private getReposFromPath = async (path: string) => {
    let page = 1;
    const limit = 50;
    const allRepos: GiteaRepo[] = [];
    let hasMore = true;

    while (hasMore) {
      const url = `${this.settings.url}${path}?${new URLSearchParams({ limit: limit.toString(), page: page.toString() }).toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${this.settings.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        this.logger.error(`Failed to fetch repos`, {
          status: response.status,
          response: await response.text(),
          url,
        });
        return allRepos;
      }

      const repos: GiteaRepo[] = repoListResponse.parse(await response.json());

      if (repos.length > 0) {
        allRepos.push(...repos);
        page++;
      } else {
        hasMore = false;
      }
    }

    this.logger.debug(`Fetched repos`, {
      path,
      repos: allRepos,
    });

    return allRepos;
  };

  public getRepos = async (): Promise<GiteaRepo[]> => {
    if (this.settings.org) {
      return this.getReposFromPath(`/orgs/${this.settings.org}/repos`);
    } else {
      return this.getReposFromPath("/repos");
    }
  };

  public createRepoMirror = async (sourceRepo: GitHubRepo) => {
    const owner = this.settings.org ?? this.settings.user;
    if (!owner) {
      throw new Error("No owner found");
    }
    const request: CreateRepoMirrorRequest = {
      service: "github",
      mirror: this.settings.mirror ?? true,
      mirror_interval: this.settings.interval ?? "24h",
      clone_addr: sourceRepo.clone_url,
      repo_name: sourceRepo.name,
      repo_owner: owner,
      auth_token: this.githubAccessTokens.join(","),
      description: sourceRepo.description,
      private: !this.settings.public,
      issues: this.settings.items?.some((item) => item === "issues") ?? false,
      labels: this.settings.items?.some((item) => item === "labels") ?? false,
      milestones:
        this.settings.items?.some((item) => item === "milestones") ?? false,
      releases:
        this.settings.items?.some((item) => item === "releases") ?? false,
      pull_requests:
        this.settings.items?.some((item) => item === "pull-requests") ?? false,
      wiki: this.settings.items?.some((item) => item === "wiki") ?? false,
    };
    this.logger.debug(`Creating repo mirror`, {
      sourceRepo,
      request,
    });
    const response = await fetch(`${this.settings.url}/repos/migrate`, {
      method: "POST",
      headers: {
        Authorization: `token ${this.settings.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      this.logger.error(`Failed to create repo mirror`, {
        status: response.status,
        response: await response.text(),
        sourceRepo,
      });
    }
  };
}

export type GiteaApiServiceFactory = (
  logger: Logger,
  settings: GiteaMirrorSettings,
  githubAccessTokens: string[],
) => GiteaApiService;

export const defaultGiteaApiServiceFactory: GiteaApiServiceFactory = (
  logger,
  settings,
  githubAccessTokens,
) => new GiteaApiService(logger, settings, githubAccessTokens);
