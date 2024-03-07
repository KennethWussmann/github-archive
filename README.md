<div align="center">
  <h1><code>github-archive</code></h1>
  <p>
    <strong>Create mirrors of GitHub repos</strong>
  </p>
</div>

## Features

- [x] Create backups from GitHub
  - [x] Starred repos
  - [x] Public repos of any user
  - [x] Private and public repos you own
- [x] Define multiple jobs for different users and different Gitea destinations

## In a nutshell

GitHub repos that were previously open-source sometimes get taken down. `github-archive` is a cronjob as a Docker image that will poll the repos configured repo sources on GitHub and will automatically create a mirror in your [Gitea](https://gitea.com/) instance.
Gitea will download the repository and can even download wikis, labels, issues, pull requests, releases and milestones. It can also keep the source code in sync as long as the upstream source is available.

You can archive all the repos you ever starred on GitHub or create a private archive of all your public and private repos on GitHub. As `github-archive` continously polls once it's set up, you can just forget about it and star or create repos as you like. It will take care of the archival for you.

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
  - type: repos
    name: "Public Repos of Someone"
    schedule: "1 0 * * *"
    githubSource:
      user: "ghost"
  - type: repos
    name: "My Private Repos"
    schedule: "1 0 * * *"
    githubSource:
      filter:
        visibility:
          - private
```

For more details see the [Getting Started guide](./docs/getting-started.md) and [Configuration guide](./docs/configuration.md)

---

Please ensure that the software license of the software you want to archive is actually allowing this use-case.
