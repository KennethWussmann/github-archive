# Getting Started

`github-archive` is best hosted in a Docker container using Docker Compose like in the example below.

**Image:** `ghcr.io/kennethwussmann/github-archive`

**Tags:**

- `latest` - The latest stable release
- `x.x.x` - Specific version (see [Releases](https://github.com/KennethWussmann/github-archive/releases))
- `develop` - Latest up-to-date development build with features still in progress (unstable)

```YAML
services:
  github-archive:
    image: ghcr.io/kennethwussmann/github-archive:latest
    restart: always
    environment:
      GITHUB_USER: Username
      GITEA_ORG: github-archive
      GITEA_API_KEY: <fill-me>
      GITEA_URL: https://gitea.example.com/api/v1
```

This is the minimal set of configuration to get started. For more customization see [Configuration Guide](./configuration.md)
