<div align="center">
  <h1><code>github-archive</code></h1>
  <p>
    <strong>Create mirrors of starred GitHub repos</strong>
  </p>
</div>

## Features

- [x] Back-up GitHub starred repos to Gitea
- [x] Define multiple jobs for different users and different Gitea destinations

## In a nutshell

GitHub repos that were previously open-source sometimes get taken down. `github-archive` is a cronjob as a Docker image that will poll the repos that you starred on GitHub and will automatically create a mirror in your [Gitea](https://gitea.com/) instance.
Gitea will download the repository and can even download wikis, labels, issues, pull requests, releases and milestones. It can also keep the source code in sync as long as the upstream source is available.

## Getting Started

`github-archive` is a simple Docker image to just host somewhere and run in the background.

**`docker-compose.yaml`**

```YAML
services:
  github-archive:
    image: ghcr.io/kennethwussmann/github-archive:latest
    restart: always
    volumes:
      - ./jobs.yaml:/app/jobs.yaml
```

**`jobs.yaml`**

```YAML
githubSource:
  accessTokens: "fill-me"
giteaDestination:
  url: https://try.gitea.io/api/v1
  accessToken: "fill-me"
  org: github-archive-test
jobs:
  - type: starred
    name: "Starred Repos"
    schedule: "1 0 * * *"
    githubSource:
      user: "SomeUsername"
```

For more details see the [Getting Started guide](./docs/getting-started.md) and [Configuration guide](./docs/configuration.md)

---

Please ensure that the software license of the software you want to archive is actually allowing this use-case.
