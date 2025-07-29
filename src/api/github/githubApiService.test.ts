import nock from "nock";
import { describe, expect, it } from "vitest";
import { testLogger } from "../../../test/testLogger";
import { GitHubApiService } from "./githubApiService";
import type { GitHubRepo } from "./schema";

const service = new GitHubApiService(testLogger, "token", "someone");
const serviceWithoutUser = new GitHubApiService(testLogger, "token", undefined);

describe("GitHubApiService", () => {
  it("should get starred repos from all pages", async () => {
    const scope = nock("https://api.github.com");

    scope
      .get("/users/someone/starred")
      .query({ per_page: "100", page: "1" })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(200, [
        {
          id: 1,
          clone_url: "https://github.com/someone/repo.git",
          full_name: "someone/repo",
          name: "repo",
          description: "A test repo",
          visibility: "public",
        },
      ] satisfies GitHubRepo[]);
    scope
      .get("/users/someone/starred")
      .query({ per_page: "100", page: "2" })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(200, [
        {
          id: 2,
          clone_url: "https://github.com/someone/repo-2.git",
          full_name: "someone/repo-2",
          name: "repo-2",
          description: "Another test repo",
          visibility: "public",
        },
      ] satisfies GitHubRepo[]);
    scope
      .get("/users/someone/starred")
      .query({ per_page: "100", page: "3" })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(404);

    const repos = await service.getStarredRepos();

    scope.done();
    expect(repos).toMatchInlineSnapshot(`
      [
        {
          "clone_url": "https://github.com/someone/repo.git",
          "description": "A test repo",
          "full_name": "someone/repo",
          "id": 1,
          "name": "repo",
          "visibility": "public",
        },
        {
          "clone_url": "https://github.com/someone/repo-2.git",
          "description": "Another test repo",
          "full_name": "someone/repo-2",
          "id": 2,
          "name": "repo-2",
          "visibility": "public",
        },
      ]
    `);
  });

  it("should get all repos from all pages of current user", async () => {
    const scope = nock("https://api.github.com");

    scope
      .get("/user/repos")
      .query({
        per_page: "100",
        page: "1",
        sort: "created",
        direction: "desc",
        type: "owner",
      })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(200, [
        {
          id: 1,
          clone_url: "https://github.com/someone/repo.git",
          full_name: "someone/repo",
          name: "repo",
          description: "A test repo",
          visibility: "public",
        },
      ] satisfies GitHubRepo[]);
    scope
      .get("/user/repos")
      .query({
        per_page: "100",
        page: "2",
        sort: "created",
        direction: "desc",
        type: "owner",
      })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(200, [
        {
          id: 2,
          clone_url: "https://github.com/someone/repo-2.git",
          full_name: "someone/repo-2",
          name: "repo-2",
          description: "Another test repo",
          visibility: "private",
        },
      ] satisfies GitHubRepo[]);
    scope
      .get("/user/repos")
      .query({
        per_page: "100",
        page: "3",
        sort: "created",
        direction: "desc",
        type: "owner",
      })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(404);

    const repos = await serviceWithoutUser.getUserRepos();

    scope.done();
    expect(repos).toMatchInlineSnapshot(`
      [
        {
          "clone_url": "https://github.com/someone/repo.git",
          "description": "A test repo",
          "full_name": "someone/repo",
          "id": 1,
          "name": "repo",
          "visibility": "public",
        },
        {
          "clone_url": "https://github.com/someone/repo-2.git",
          "description": "Another test repo",
          "full_name": "someone/repo-2",
          "id": 2,
          "name": "repo-2",
          "visibility": "private",
        },
      ]
    `);
  });

  it("should get all repos from all pages of configured user", async () => {
    const scope = nock("https://api.github.com");

    scope
      .get("/users/someone/repos")
      .query({
        per_page: "100",
        page: "1",
        sort: "created",
        direction: "desc",
        type: "owner",
      })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(200, [
        {
          id: 1,
          clone_url: "https://github.com/someone/repo.git",
          full_name: "someone/repo",
          name: "repo",
          description: "A test repo",
          visibility: "public",
        },
      ] satisfies GitHubRepo[]);
    scope
      .get("/users/someone/repos")
      .query({
        per_page: "100",
        page: "2",
        sort: "created",
        direction: "desc",
        type: "owner",
      })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(200, [
        {
          id: 2,
          clone_url: "https://github.com/someone/repo-2.git",
          full_name: "someone/repo-2",
          name: "repo-2",
          description: "Another test repo",
          visibility: "public",
        },
      ] satisfies GitHubRepo[]);
    scope
      .get("/users/someone/repos")
      .query({
        per_page: "100",
        page: "3",
        sort: "created",
        direction: "desc",
        type: "owner",
      })
      .matchHeader("accept", "application/vnd.github+json")
      .matchHeader("authorization", "Bearer token")
      .matchHeader("x-github-api-version", "2022-11-28")
      .reply(404);

    const repos = await service.getUserRepos();

    scope.done();
    expect(repos).toMatchInlineSnapshot(`
      [
        {
          "clone_url": "https://github.com/someone/repo.git",
          "description": "A test repo",
          "full_name": "someone/repo",
          "id": 1,
          "name": "repo",
          "visibility": "public",
        },
        {
          "clone_url": "https://github.com/someone/repo-2.git",
          "description": "Another test repo",
          "full_name": "someone/repo-2",
          "id": 2,
          "name": "repo-2",
          "visibility": "public",
        },
      ]
    `);
  });
});
