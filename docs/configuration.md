# Configuration

This document outlines the environment variables used to configure the behavior of github-archive.

## Configuration Overview

The application uses the following environment variables for its configuration:

- `GITHUB_USER`: The GitHub username. **Required.**
- `GITHUB_PAT`: Personal Access Token(s) for GitHub, separated by commas (,). Optional.
- `GITEA_ORG`: The Gitea organization name where mirrors will be created. Only one of `GITEA_ORG` or `GITEA_USER` can be specified. The org has to exist, it will not be created. Optional.
- `GITEA_USER`: The Gitea username where mirrors will be created. Only one of `GITEA_ORG` or `GITEA_USER` can be specified. Optional.
- `GITEA_API_KEY`: The API key for Gitea. **Required.**
- `GITEA_URL`: The base URL for the Gitea instance. **Required.**
- `GITEA_CREATE_PUBLIC`: Determines if the repositories should be created as public in Gitea. Defaults to `false`. Acceptable values are `true` or `false`.
- `GITEA_MIGRATION_ITEMS`: Specifies the items to be migrated to Gitea. Defaults to "wiki,labels,issues,pull-requests,releases,milestones". Each item should be separated by a comma (,). The possible items are:

  - `wiki`
  - `labels`
  - `issues`
  - `pull-requests`
  - `releases`
  - `milestones`

  This is nullable. **By default, all items will be migrated.**

- `GITEA_MIRROR_INTERVAL`: The interval at which the repository should be mirrored. Defaults to `1d` (once a day).
- `CRON_SCHEDULE`: The schedule for the cron job at which it will create mirrors of starred repos in cron format. Defaults to `0 0 * * *` (runs at midnight every day).

## Rate Limiting

The GitHub API will rate-rate limit at some point. You can specify multiple personal access tokens in `GITHUB_PAT` by separating them by comma. That will cause Gitea to rotate them when needed.

## Debugging and Monitoring

- `LOG_LEVEL`: Log level used to control visiblity of messages. The possible items are:
  - `info` (default)
  - `debug`
  - `error`
- `LOG_DESTINATION`: Optionally write logs to files in addition to stdout. Specify a path on a Docker volume.