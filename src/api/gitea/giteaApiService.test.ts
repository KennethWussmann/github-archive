import { describe, expect, it } from "vitest";
import { testLogger } from "../../../test/testLogger";
import nock from "nock";
import { GiteaApiService } from "./giteaApiService";
import { type CreateRepoMirrorRequest, type GiteaRepo } from "./schema";
import { type GiteaMirrorSettings } from "../../jobs/schema";

describe("GiteaApiService", () => {
  it("should get repos from all pages of org", async () => {
    const service = new GiteaApiService(
      testLogger,
      {
        accessToken: "gitea-token",
        interval: "1h",
        url: "https://example.com",
        items: ["wiki"],
        mirror: true,
        org: "github-archive",
        public: false,
      },
      ["gh-token"],
    );
    const scope = nock("https://example.com");

    scope
      .get("/orgs/github-archive/repos")
      .query({ limit: "50", page: "1" })
      .matchHeader("authorization", "token gitea-token")
      .matchHeader("content-type", "application/json")
      .reply(200, [
        {
          name: "repo-1",
        },
      ] satisfies GiteaRepo[]);
    scope
      .get("/orgs/github-archive/repos")
      .query({ limit: "50", page: "2" })
      .matchHeader("authorization", "token gitea-token")
      .matchHeader("content-type", "application/json")
      .reply(200, [
        {
          name: "repo-2",
        },
      ] satisfies GiteaRepo[]);
    scope
      .get("/orgs/github-archive/repos")
      .query({ limit: "50", page: "3" })
      .matchHeader("authorization", "token gitea-token")
      .matchHeader("content-type", "application/json")
      .reply(404);

    const repos = await service.getRepos();

    scope.done();
    expect(repos).toMatchInlineSnapshot(`
      [
        {
          "name": "repo-1",
        },
        {
          "name": "repo-2",
        },
      ]
    `);
  });
  it("should get repos from all pages of user", async () => {
    const service = new GiteaApiService(
      testLogger,
      {
        accessToken: "gitea-token",
        interval: "1h",
        url: "https://example.com",
        items: ["wiki"],
        mirror: true,
        user: "someuser",
        public: false,
      },
      ["gh-token"],
    );
    const scope = nock("https://example.com");

    scope
      .get("/repos")
      .query({ limit: "50", page: "1" })
      .matchHeader("authorization", "token gitea-token")
      .matchHeader("content-type", "application/json")
      .reply(200, [
        {
          name: "repo-1",
        },
      ] satisfies GiteaRepo[]);
    scope
      .get("/repos")
      .query({ limit: "50", page: "2" })
      .matchHeader("authorization", "token gitea-token")
      .matchHeader("content-type", "application/json")
      .reply(200, [
        {
          name: "repo-2",
        },
      ] satisfies GiteaRepo[]);
    scope
      .get("/repos")
      .query({ limit: "50", page: "3" })
      .matchHeader("authorization", "token gitea-token")
      .matchHeader("content-type", "application/json")
      .reply(404);

    const repos = await service.getRepos();

    scope.done();
    expect(repos).toMatchInlineSnapshot(`
      [
        {
          "name": "repo-1",
        },
        {
          "name": "repo-2",
        },
      ]
    `);
  });
  it.each([
    [
      {
        accessToken: "gitea-token",
        interval: "1h",
        url: "https://example.com",
        items: ["wiki"],
        mirror: true,
        org: "github-archive",
        public: false,
      },
      {
        service: "github",
        mirror: true,
        mirror_interval: "1h",
        clone_addr: "https://github.com/someuser/repo.git",
        repo_name: "repo",
        repo_owner: "github-archive",
        auth_token: "gh-token-1,gh-token-2",
        description: "A test repo",
        private: true,
        issues: false,
        labels: false,
        milestones: false,
        releases: false,
        pull_requests: false,
        wiki: true,
      },
    ],
    // ---
    [
      {
        accessToken: "gitea-token",
        interval: "24h",
        url: "https://example.com",
        items: [
          "wiki",
          "issues",
          "labels",
          "milestones",
          "releases",
          "pull-requests",
        ],
        mirror: false,
        org: "github-archive",
        public: false,
      },
      {
        service: "github",
        mirror: false,
        mirror_interval: "24h",
        clone_addr: "https://github.com/someuser/repo.git",
        repo_name: "repo",
        repo_owner: "github-archive",
        auth_token: "gh-token-1,gh-token-2",
        description: "A test repo",
        private: true,
        issues: true,
        labels: true,
        milestones: true,
        releases: true,
        pull_requests: true,
        wiki: true,
      },
    ],
  ] satisfies [GiteaMirrorSettings, CreateRepoMirrorRequest][])(
    "should create mirror from GitHubRepo",
    async (
      mirrorSettings: GiteaMirrorSettings,
      expectedRequest: CreateRepoMirrorRequest,
    ) => {
      const service = new GiteaApiService(testLogger, mirrorSettings, [
        "gh-token-1",
        "gh-token-2",
      ]);
      const scope = nock("https://example.com");

      scope
        .post("/repos/migrate", JSON.stringify(expectedRequest))
        .matchHeader("authorization", "token gitea-token")
        .matchHeader("content-type", "application/json")
        .reply(201);

      await service.createRepoMirror({
        id: 1,
        clone_url: "https://github.com/someuser/repo.git",
        description: "A test repo",
        full_name: "someuser/repo",
        name: "repo",
        visibility: "public",
      });

      scope.done();
    },
  );
});
