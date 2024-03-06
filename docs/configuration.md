# Configuration

This document outlines the options used to configure the behavior of github-archive.

## Jobs Configuration File

github-archive allows to define multiple archival jobs. This is handy if you want to archive the starred repositories of mulitple GitHub users.

Jobs are configured in a `jobs.yaml` or `jobs.json` that can be mounted into the Docker container. It can be written in either JSON or YAML. We will use YAML in all examples.

```YAML
githubSource:
  accessTokens: # Define GitHub Personal Access Tokens that should be used. Optional in most cases.
    - token1
    - token2
  # Alternatively you can also only specify one:
  # accessTokens: single-token
giteaDestination:
  # The org in which repositories will be created in. Either org or user is required. They cannot be used together.
  org: exampleOrg
  # The username of the user in which repositories will be created in. Either org or user is required. They cannot be used together.
  user: exampleUser
  # The URL of the Gitea instance ending with "/api/v1" where the repos will be created
  url: https://try.gitea.io/api/v1
  # Access Token to the above configured Gitea instance
  accessToken: exampleAccessToken
  # Whether Gitea should regularly sync the content of the upstream repo. Optional, default: true
  #mirror: true
  # Interval at which Gitea should re-sync. Optional, default: 24h
  #interval: 24h
  # Visibility of the Gitea repo. Optional, default: false
  #public: false
  # The items that Gitea should migrate. When using anything in addition to "wiki", the GitHub Access Token is required
  items:
    - wiki
    #- labels
    #- issues
    #- pull-requests
    #- releases
    #- milestones
jobs:
  - type: starred # Required! Has to be "starred". There are currently no other types available.
    # Some descriptive name for the job used in logs
    name: My Example Job
    # Whether this job should be actually syncing repos. Can be handy to temporarily disable a job. Optional, default: true
    #active: true
    # Cron expression that configures when this job should run. Optional, default: 0 0 * * *
    #schedule: 0 0 * * *
    githubSource:
      # Required. The GitHub username of the user that this job is syncing starred repos from.
      user: exampleGitHubUser
      # You can optionally overwrite the GitHub access tokens per job. They will be used instead the above configured
      #accessTokens:
      #  - token1
      #  - token2
      # Option 2: As a single string (commented out)
      # accessTokens: single-token-string
    # You can optionally overwrite the above configured Gitea mirror settings. They will be merged with the above settings. This allows to configure a different Gitea instance per job or further customize mirroring by job
    #giteaDestination:
    #  org: exampleOrg
    #  user: exampleUser
    #  accessToken: exampleAccessToken
    #  url: https://example.com
    #  mirror: true
    #  public: false
    #  interval: 24h
    #  items:
    #    - wiki
    #    - labels
    #    - issues
    #    - pull-requests
    #    - releases
    #    - milestones
```

## GitHub Access Tokens and Rate Limiting

GitHub access tokens are not always required. When the user you want to mirror starred repos from has their details public for example. But when you use other migration items apart from only `wiki`, at least one GitHub access token is required.

The GitHub API will rate limit at some point. That's why multiple access tokens can be specified. That will cause Gitea to rotate them when needed.

## Environment Variables

In addition to the YAML/JSON configuration there are some configuration options via environment variables:

- `JOBS_FILE_PATH`: Path to file on disk where the jobs are configured. This can be a path to a `.yaml` or `.json` file, what ever file format you prefer. Default `./jobs.yaml`. Optional.
- `LOG_LEVEL`: Log level used to control visiblity of messages. The possible items are:
  - `info` (default)
  - `debug`
  - `error`
- `LOG_DESTINATION`: Optionally write logs to files in addition to stdout. Specify a path on a Docker volume.
