import { describe, expect, it } from "vitest";
import { testLogger } from "../../../test/testLogger";
import { GitHubApiService } from "./githubApiService";
import nock from "nock";
import { type GitHubRepo } from "./schema";

const service = new GitHubApiService(testLogger, "token", "someone");

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
        },
        {
          "clone_url": "https://github.com/someone/repo-2.git",
          "description": "Another test repo",
          "full_name": "someone/repo-2",
          "id": 2,
          "name": "repo-2",
        },
      ]
    `);
  });
});
