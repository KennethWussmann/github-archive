# Getting Started

`github-archive` is best hosted in a Docker container using Docker Compose like in the example below.

**Image:** `ghcr.io/kennethwussmann/github-archive`

**Tags:**

- `latest` - The latest stable release
- `x.x.x` - Specific version (see [Releases](https://github.com/KennethWussmann/github-archive/releases))
- `develop` - Latest up-to-date development build with features still in progress (unstable)

github-archive requires to already have a Gitea instance running somewhere. Refer to t[heir getting started guide](https://docs.gitea.com/installation/install-with-docker) to set one up.

```YAML
services:
  github-archive:
    image: ghcr.io/kennethwussmann/github-archive:latest
    restart: always
    volumes:
      - ./jobs.yaml:/app/jobs.yaml
```

## Configuration

We also need to create a configuration file `jobs.yaml` next to the `docker-compose.yaml` that is mounted via volumes:

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

This is the minimal set of configuration to get started. For more customization see [Configuration Guide](./configuration.md)
