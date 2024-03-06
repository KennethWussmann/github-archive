import { type Logger } from "winston";
import {
  repoListResponse,
  type GiteaRepo,
  type CreateRepoMirrorRequest,
} from "./schema";
import { type GitHubRepo } from "../github/schema";
import { type GiteaMigrationItem } from "../../utils/config";

export class GiteaApiService {
  constructor(
    private readonly logger: Logger,
    private readonly url: string,
    private readonly apiKey: string,
    private readonly org: string | undefined,
    private readonly user: string | undefined,
    private readonly createPublic: boolean,
    private readonly mirrorInterval: string,
    private readonly gitHubPATs: string[],
    private readonly migrationItems: GiteaMigrationItem[],
  ) {
    this.logger.info("MIGRATION ITEMS", { migrationItems });
  }

  private getReposFromPath = async (path: string) => {
    let page = 1;
    const limit = 50;
    const allRepos: GiteaRepo[] = [];
    let hasMore = true;

    while (hasMore) {
      const url = `${this.url}${path}?${new URLSearchParams({ limit: limit.toString(), page: page.toString() }).toString()}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `token ${this.apiKey}`,
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

      if (repos.length < limit) {
        hasMore = false;
      } else {
        page++;
      }

      allRepos.push(...repos);
    }

    this.logger.debug(`Fetched repos`, {
      path,
      repos: allRepos,
    });

    return allRepos;
  };

  public getRepos = async (): Promise<GiteaRepo[]> => {
    if (this.org) {
      return this.getReposFromPath(`/orgs/${this.org}/repos`);
    } else {
      return this.getReposFromPath("/repos");
    }
  };

  public createRepoMirror = async (sourceRepo: GitHubRepo) => {
    const owner = this.org ?? this.user;
    if (!owner) {
      throw new Error("No owner found");
    }
    const request: CreateRepoMirrorRequest = {
      service: "github",
      mirror: true,
      mirror_interval: this.mirrorInterval,
      clone_addr: sourceRepo.clone_url,
      repo_name: sourceRepo.name,
      repo_owner: owner,
      auth_token: this.gitHubPATs.join(","),
      description: sourceRepo.description,
      private: !this.createPublic,
      issues: this.migrationItems.some((item) => item === "issues"),
      labels: this.migrationItems.some((item) => item === "labels"),
      milestones: this.migrationItems.some((item) => item === "milestones"),
      releases: this.migrationItems.some((item) => item === "releases"),
      pull_requests: this.migrationItems.some(
        (item) => item === "pull-requests",
      ),
      wiki: this.migrationItems.some((item) => item === "wiki"),
    };
    this.logger.debug(`Creating repo mirror`, {
      sourceRepo,
      request,
    });
    const response = await fetch(`${this.url}/repos/migrate`, {
      method: "POST",
      headers: {
        Authorization: `token ${this.apiKey}`,
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
