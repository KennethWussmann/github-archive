# Configuration

This document outlines the environment variables used to configure the behavior of github-archive.

## Configuration Overview

The application uses the following environment variables for its configuration:

- `GITHUB_USER`: The GitHub username. **Required.**
- `GITHUB_PAT`: Personal Access Token(s) for GitHub, separated by commas (,). Will be used for polling starred repos as well as by Gitea to import data. Optional, but required if migration items other than `wiki` are specified.
- `GITEA_ORG`: The Gitea organization name where mirrors will be created. Only one of `GITEA_ORG` or `GITEA_USER` can be specified. The org has to exist, it will not be created. Optional.
- `GITEA_USER`: The Gitea username where mirrors will be created. Only one of `GITEA_ORG` or `GITEA_USER` can be specified. Optional.
- `GITEA_API_KEY`: The API key for Gitea. **Required.**
- `GITEA_URL`: The URL for the Gitea instance. **Required.** (Example format: `https://gitea.example.com/api/v1`)
- `GITEA_CREATE_PUBLIC`: Determines if the repositories should be created as public in Gitea. Defaults to `false`. Acceptable values are `true` or `false`.
- `GITEA_MIGRATION_ITEMS`: Specifies the items to be migrated to Gitea. Defaults to `wiki`. Each item should be separated by a comma (,). The possible items are:

  - `wiki`
  - `labels`
  - `issues`
  - `pull-requests`
  - `releases`
  - `milestones`

  This is nullable. When using together with `GITEA_MIRROR=true`, only `wiki` is supported. If mirroring is disabled, all can be imported once, but won't continously mirror.

- `GITEA_MIRROR`: Whether to keep the repo in sync with the upstream source. Defaults to `true`. Acceptable values are `true` or `false`.
- `GITEA_MIRROR_INTERVAL`: The interval at which the repository should be mirrored. Defaults to `24h` (once a day).
- `CRON_SCHEDULE`: The schedule for the cron job at which it will create mirrors of starred repos in cron format. Defaults to `0 0 * * *` (runs at midnight every day).

## Rate Limiting

The GitHub API will rate-rate limit at some point. You can specify multiple personal access tokens in `GITHUB_PAT` by separating them by comma. That will cause Gitea to rotate them when needed.

## Debugging and Monitoring

- `LOG_LEVEL`: Log level used to control visiblity of messages. The possible items are:
  - `info` (default)
  - `debug`
  - `error`
- `LOG_DESTINATION`: Optionally write logs to files in addition to stdout. Specify a path on a Docker volume.
