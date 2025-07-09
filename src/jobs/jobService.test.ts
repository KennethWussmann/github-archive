import { beforeEach, describe, expect, it, vitest } from "vitest";
import { mock, mockReset } from "vitest-mock-extended";
import { Logger } from "winston";
import { testLogger } from "../../test/testLogger";
import type { GiteaApiService } from "../api/gitea/giteaApiService";
import type { GitHubApiService } from "../api/github/githubApiService";
import type { GitHubRepo } from "../api/github/schema";
import { JobService } from "./jobService";
import type { GiteaMirrorSettings } from "./schema";

const mockGitHubApiService = mock<GitHubApiService>();
const mockGitHubApiServiceFactory = vitest.fn(() => mockGitHubApiService);
const mockGiteaApiService = mock<GiteaApiService>();
const mockGiteaApiServiceFactory = vitest.fn(() => mockGiteaApiService);

const service = new JobService(
  testLogger,
  () => ({
    githubSource: {
      accessTokens: ["test"],
    },
    giteaDestination: {
      accessToken: "test",
      url: "https://example.com",
      org: "github-archive",
    },
    jobs: [
      {
        type: "starred",
        name: "test",
        githubSource: {
          user: "someone",
        },
        giteaDestination: undefined,
      },
      {
        type: "starred",
        name: "test",
        githubSource: {
          user: "someone",
        },
        giteaDestination: {
          org: "different-org",
          public: true,
        },
      },
      {
        type: "repos",
        name: "test",
        githubSource: {
          user: "someone",
        },
      },
    ],
  }),
  mockGitHubApiServiceFactory,
  mockGiteaApiServiceFactory,
);

const testRepo: GitHubRepo = {
  id: 1,
  clone_url: "https://example.com/user/repo.git",
  full_name: "user/repo",
  name: "repo",
  description: "A test repo",
  visibility: "public",
};

describe("JobService", () => {
  beforeEach(() => {
    mockReset(mockGitHubApiService);
    mockReset(mockGiteaApiService);
  });

  it("should load and run all starred repo mirror jobs and create mirror of missing mirror", async () => {
    mockGitHubApiService.getStarredRepos.mockResolvedValue([testRepo]);
    mockGiteaApiService.getRepos.mockResolvedValue([]);

    await service.start();
    await service.runAllJobs();

    expect(mockGitHubApiServiceFactory).toHaveBeenCalledWith(
      expect.any(Logger),
      "test",
      "someone",
    );
    // first job, only root settings
    expect(mockGiteaApiServiceFactory).toHaveBeenCalledWith(
      expect.any(Logger),
      {
        accessToken: "test",
        interval: undefined,
        items: undefined,
        mirror: undefined,
        org: "github-archive",
        public: undefined,
        url: "https://example.com",
        user: undefined,
      } satisfies GiteaMirrorSettings,
      ["test"],
    );
    // second job, with merged job settings
    expect(mockGiteaApiServiceFactory).toHaveBeenCalledWith(
      expect.any(Logger),
      {
        accessToken: "test",
        interval: undefined,
        items: undefined,
        mirror: undefined,
        org: "different-org",
        public: true,
        url: "https://example.com",
        user: undefined,
      } satisfies GiteaMirrorSettings,
      ["test"],
    );
    expect(mockGitHubApiService.getStarredRepos).toHaveBeenCalledTimes(2);
    expect(mockGitHubApiService.getUserRepos).toHaveBeenCalledTimes(1);
    expect(mockGiteaApiService.getRepos).toHaveBeenCalledTimes(2);
    expect(mockGiteaApiService.createRepoMirror).toHaveBeenCalledWith(testRepo);
  });

  it("should load and run all starred repo mirror jobs and not create existing repo", async () => {
    mockGitHubApiService.getStarredRepos.mockResolvedValue([testRepo]);
    mockGiteaApiService.getRepos.mockResolvedValue([
      {
        name: "repo",
      },
    ]);

    await service.start();
    await service.runAllJobs();

    expect(mockGitHubApiService.getStarredRepos).toHaveBeenCalledTimes(2);
    expect(mockGitHubApiService.getUserRepos).toHaveBeenCalledTimes(1);
    expect(mockGiteaApiService.getRepos).toHaveBeenCalledTimes(2);
    expect(mockGiteaApiService.createRepoMirror).not.toHaveBeenCalled();
  });
});
