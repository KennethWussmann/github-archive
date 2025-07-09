Also look at ./AI.md

# GitHub Archive - AI Developer Guide

## Project Overview

**github-archive** is a Docker-based archival service that automatically creates mirrors of GitHub repositories in a self-hosted Gitea instance. It serves as a backup solution for preserving GitHub repositories that may become unavailable due to deletion, takedowns, or other reasons.

### Core Purpose

- **Automated Backup**: Creates scheduled mirrors of GitHub repositories
- **Repository Preservation**: Protects against loss of open-source projects
- **Continuous Synchronization**: Keeps mirrors updated with upstream changes
- **Flexible Configuration**: Supports multiple job types and configurations

### Architecture

The application follows a job-based architecture with the following key components:

- **Job Service**: Orchestrates and manages archival jobs
- **API Services**: Handle GitHub and Gitea API interactions
- **Job Types**: Support for different repository sources (starred, user repos)
- **Configuration**: YAML/JSON-based job definitions

## Important Files & Directories

### Entry Points

- `src/start.ts` - Application entry point, initializes and starts job service
- `src/applicationContext.ts` - Dependency injection container

### Core Components

- `src/jobs/jobService.ts` - Main orchestration service for managing jobs
- `src/jobs/job.ts` - Abstract base class for all job types
- `src/jobs/schema.ts` - Zod schemas for configuration validation
- `src/jobs/starredJob.ts` - Job implementation for starred repositories
- `src/jobs/reposJob.ts` - Job implementation for user repositories
- `src/jobs/jobFileProvider.ts` - Configuration file loading

### API Services

- `src/api/github/githubApiService.ts` - GitHub API client
- `src/api/gitea/giteaApiService.ts` - Gitea API client
- `src/api/github/schema.ts` - GitHub API response schemas
- `src/api/gitea/schema.ts` - Gitea API request/response schemas

### Utilities

- `src/utils/config.ts` - Environment configuration
- `src/utils/logger.ts` - Winston logging setup
- `src/utils/fileUtils.ts` - File system utilities

### Configuration & Documentation

- `jobs.yaml` - Job configuration file (mounted at runtime)
- `docs/getting-started.md` - Setup and deployment guide
- `docs/configuration.md` - Comprehensive configuration reference
- `Dockerfile` - Multi-stage build for production deployment
- `package.json` - Dependencies and scripts

## Key Terminology

### Jobs

- **Job**: A scheduled task that archives repositories from GitHub to Gitea
- **JobService**: Central orchestrator that manages all jobs
- **JobDefinition**: Configuration object defining job parameters
- **JobFile**: Complete configuration file containing all jobs and settings

### Job Types

- **starred**: Archives repositories starred by a specific GitHub user
- **repos**: Archives repositories owned by or accessible to a GitHub user

### API Components

- **GitHubApiService**: Service for fetching repository data from GitHub
- **GiteaApiService**: Service for creating repository mirrors in Gitea
- **Mirror**: A synchronized copy of a repository in Gitea

### Configuration

- **GiteaMirrorSettings**: Configuration for Gitea destination settings
- **GiteaMigrationItem**: Specific items to migrate (wiki, issues, labels, etc.)
- **RepoVisibility**: Repository visibility filter (public, private)
- **RepoTypeFilter**: Repository type filter (owner, member, public, private, all)

## Feature Set Overview

### Repository Archival Features

#### 1. Starred Repository Archival

- **Purpose**: Archive all repositories starred by a GitHub user
- **Configuration**: `type: starred` in job definition
- **Input**: GitHub username and optional access tokens
- **Output**: Mirrored repositories in Gitea organization/user account
- **Behavior**:
  - Fetches paginated list of starred repositories
  - Compares with existing Gitea repositories
  - Creates mirrors for non-existent repositories
  - Supports custom scheduling via cron expressions

#### 2. User Repository Archival

- **Purpose**: Archive repositories owned by or accessible to a GitHub user
- **Configuration**: `type: repos` in job definition
- **Input**: GitHub username (optional for authenticated user) and filters
- **Output**: Filtered repository mirrors in Gitea
- **Behavior**:
  - Fetches user repositories based on visibility and type filters
  - Supports archiving private repositories (requires authentication)
  - Filters by repository type (owner, member, public, private, all)
  - Filters by visibility (public, private)

#### 3. Multi-Job Support

- **Purpose**: Run multiple archival jobs with different configurations
- **Configuration**: Array of job definitions in `jobs.yaml`
- **Features**:
  - Independent scheduling per job
  - Job-specific GitHub and Gitea settings
  - Individual job activation/deactivation
  - Parallel job execution support

### Gitea Integration Features

#### 1. Repository Mirror Creation

- **API**: POST `/repos/migrate` on Gitea instance
- **Features**:
  - Automatic repository mirroring setup
  - Configurable sync intervals (default: 24h)
  - Repository metadata preservation
  - Access control (public/private mirrors)

#### 2. Migration Items Support

- **wiki**: Repository wiki content
- **labels**: Issue and PR labels
- **issues**: Repository issues
- **pull-requests**: Pull request history
- **releases**: Tagged releases
- **milestones**: Project milestones

#### 3. Organization and User Support

- **Organization**: Create mirrors in Gitea organization
- **User**: Create mirrors in user account
- **Flexible**: Per-job destination override capability

### GitHub API Integration

#### 1. Authentication

- **Access Tokens**: Support for multiple GitHub personal access tokens
- **Token Rotation**: Automatic rotation to handle rate limiting
- **Unauthenticated**: Support for public repository access without tokens

#### 2. Rate Limit Management

- **Multiple Tokens**: Use multiple access tokens to increase rate limits
- **Error Handling**: Graceful handling of rate limit errors
- **Retry Logic**: Built-in retry mechanisms for transient failures

#### 3. API Coverage

- **Starred Repositories**: `/users/{username}/starred`
- **User Repositories**: `/users/{username}/repos` or `/user/repos`
- **Pagination**: Automatic handling of paginated responses
- **Filtering**: Client-side filtering for visibility and type

### Operational Features

#### 1. Scheduling

- **Cron Support**: Standard cron expressions for job scheduling
- **Default Schedule**: Daily execution at midnight (0 0 \* \* \*)
- **Flexible Timing**: Per-job schedule customization
- **Manual Execution**: Support for immediate job execution

#### 2. Logging and Monitoring

- **Structured Logging**: JSON-formatted logs with context
- **Log Levels**: Configurable log levels (info, debug, error)
- **Job Tracking**: Per-job logging with job names and contexts
- **Error Reporting**: Detailed error logging with context

#### 3. Configuration Management

- **YAML/JSON**: Support for both configuration formats
- **Schema Validation**: Zod-based configuration validation
- **Environment Variables**: Runtime configuration via environment
- **Hot Reload**: Configuration changes require restart

### Expected Inputs and Outputs

#### Job Configuration Input

```yaml
githubSource:
  accessTokens: ["github_pat_token"]
giteaDestination:
  url: "https://gitea.example.com/api/v1"
  accessToken: "gitea_access_token"
  org: "archive-org"
jobs:
  - type: "starred"
    name: "My Starred Repos"
    schedule: "0 2 * * *"
    githubSource:
      user: "github_username"
```

#### Expected Outputs

- **Gitea Repositories**: Mirrored repositories in configured Gitea instance
- **Logs**: Structured logs showing job execution status
- **Error Reports**: Detailed error information for failed operations
- **Sync Status**: Regular synchronization with upstream repositories

#### Processing Flow

1. **Job Initialization**: Load configuration and validate schemas
2. **GitHub API Calls**: Fetch repository lists based on job type
3. **Gitea Repository Check**: Compare with existing repositories
4. **Mirror Creation**: Create new mirrors for non-existent repositories
5. **Status Reporting**: Log success/failure for each operation
6. **Scheduling**: Wait for next scheduled execution

### Error Handling and Edge Cases

- **Rate Limiting**: Graceful handling of GitHub API rate limits
- **Network Failures**: Retry logic for transient network issues
- **Invalid Repositories**: Skip repositories that cannot be mirrored
- **Permission Errors**: Proper error reporting for access issues
- **Configuration Errors**: Schema validation with clear error messages

This architecture provides a robust, scalable solution for automated GitHub repository archival with comprehensive configuration options and reliable error handling.
