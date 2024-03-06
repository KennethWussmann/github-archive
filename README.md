<div align="center">
  <h1><code>github-archive</code></h1>
  <p>
    <strong>Create mirrors of starred GitHub repos</strong>
  </p>
</div>

## In a nutshell

GitHub repos that were previously open-source sometimes get taken down. `github-archive` is a cronjob as a Docker image that will poll the repos that you starred on GitHub and will automatically create a mirror in your [Gitea](https://gitea.com/) instance.
Gitea will download the repository and can even mirror wikis, labels, issues, pull requests, releases and milestones. It will also keep the mirror in sync as long as the source is available.

## Getting Started

`github-archive` is a simple Docker image to just host somewhere and run in the background.

```YAML
services:
  github-archive:
    image: ghcr.io/kennethwussmann/github-archive:latest
    restart: always
    environment:
      GITHUB_USER: Username
      GITHUB_PAT: <fill-me>
      GITEA_ORG: github-archive
      GITEA_API_KEY: <fill-me>
      GITEA_URL: https://gitea.example.com/api/v1
```

For more details see the [Getting Started guide](./docs/getting-started.md) and [Configuration guide](./docs/configuration.md)

---

Please ensure that the software license of the software you want to archive is actually allowing this use-case.
