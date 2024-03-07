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
  - type: starred # Required for this kind of job. Can be "starred" or "repos". See for a "repos" example below.
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
  - type: repos # Required for this kind of job. Can be "repos" or "starred". See for a "starred" example above.
    # Some descriptive name for the job used in logs
    name: My Example Job
    # Whether this job should be actually syncing repos. Can be handy to temporarily disable a job. Optional, default: true
    #active: true
    # Cron expression that configures when this job should run. Optional, default: 0 0 * * *
    #schedule: 0 0 * * *
    githubSource:
      # Optional. The GitHub username of the user that this job is syncing repos from. If none is provided, the authenticated user is used. Default: null
      user: exampleGitHubUser
      # Optional. Different types of filters for repos that should be synced
      filter:
        # Optional. Filter repos by type. Possible options: all, owner, public, private, member. Default: owner
        type: owner
        # Optional. Filter repos by visibility. Default: private, public
        visibility:
          - private
          - public
    # All other options of the "starred" job type apply here as well, like giteaDestination.
```

## Different Job Types

github-archive can archive all sorts of repositories. What is being archived is determined by the job's `type`

### `starred`

Jobs of the type `starred` will archive repos that you or any configured user have starred on GitHub.

### `repos`

Jobs of the type `repos` will archive any repos on GitHub by a specific user.

#### Archiving your own private repos

This example will archive all the private repos the authenticated user owns. If you want to archive repos of the currently authenticated user, **don't configure your own GitHub username** in the `githubSource.user`, otherwise github-archive can only access your public repos.

```YAML
githubSource:
  accessTokens: gh-token
giteaDestination:
  org: exampleOrg
  url: https://try.gitea.io/api/v1
  accessToken: exampleAccessToken
jobs:
  - type: repos
    name: My private repos
    schedule: 0 0 * * *
    githubSource:
      # Notice: No user is configured here. It will be inferred by the used GitHub access token
      filter:
        # We only want repos we own
        type: owner
        # Only archive private repos
        visibility:
          - private
```

#### Archiving someone else's public repos

This example will archive all the public repos of any user on GitHub.

```YAML
# We don't need a GitHub access token for that, unless we run in rate-limiting issues.
giteaDestination:
  org: exampleOrg
  url: https://try.gitea.io/api/v1
  accessToken: exampleAccessToken
jobs:
  - type: repos
    name: Ghosts public repos
    schedule: 0 0 * * *
    githubSource:
      # The user from which we want to archive:
      user: ghost
      # We wouldn't need to configure any filters, because by default we only have access to their public repos.
      # This below would be the default config anyways:
      #filter:
      #  # Only repos they own
      #  type: owner
      #  # Only archive public repos
      #  visibility:
      #    - public
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
