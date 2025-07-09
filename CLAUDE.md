# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a TypeScript-based GitHub archive service that mirrors GitHub repositories to Gitea instances. It runs as a cron job-based service, either as a standalone Node.js application or in a Docker container.

## Architecture

### Core Components

- **Application Context** (`src/applicationContext.ts`): Dependency injection container that wires up services
- **Job Service** (`src/jobs/jobService.ts`): Manages and executes archival jobs based on configuration
- **Job Types**:
  - `StarredJob` (`src/jobs/starredJob.ts`): Archives starred repositories from GitHub users
  - `ReposJob` (`src/jobs/reposJob.ts`): Archives public/private repositories from GitHub users
- **API Services**:
  - `GitHubApiService` (`src/api/github/`): Handles GitHub API interactions
  - `GiteaApiService` (`src/api/gitea/`): Handles Gitea API interactions for creating mirrors
- **Configuration**: Jobs are defined in `jobs.yaml` with support for multiple archival jobs

### Data Flow

1. Application starts and loads job configuration from `jobs.yaml`
2. Jobs are scheduled using cron expressions
3. Each job fetches repositories from GitHub API
4. Creates mirror repositories in configured Gitea instance
5. Gitea handles the actual repository mirroring and syncing

## Development Commands

### Building and Running

- `npm run build` - Type check and build with ncc
- `npm run start` - Run the application directly with tsx
- `npm run dev` - Run in development mode with file watching

### Code Quality

- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Run ESLint with auto-fixing
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Testing

- `npm run test` - Run tests with Vitest
- Tests are located in `src/` alongside source files (`.test.ts` suffix)

### Schema Generation

- `npm run generate-schema` - Generate JSON schema for jobs configuration

### Development Tools

- Uses `pnpm` as package manager (required version 10.13.1)
- Node.js 22 is required
- TypeScript with strict configuration
- Husky for git hooks with lint-staged

## Configuration

### Jobs Configuration (`jobs.yaml`)

The main configuration file defining:

- GitHub source settings (access tokens, user filters)
- Gitea destination settings (URL, access token, organization)
- Job definitions with cron schedules

### Environment Variables

- `JOBS_FILE_PATH`: Path to jobs configuration file (default: `./jobs.yaml`)
- `LOG_LEVEL`: Logging level (`info`, `debug`, `error`)
- `LOG_DESTINATION`: Optional file logging destination

## Key Technologies

- **TypeScript**: Strict configuration with comprehensive type checking
- **Winston**: Structured logging with daily rotation support
- **Zod**: Schema validation for configuration
- **Vitest**: Testing framework
- **node-cron**: Cron job scheduling
- **Docker**: Containerized deployment support

## Important Notes

- The service is designed to run continuously as a background process
- Rate limiting is handled by supporting multiple GitHub access tokens
- Gitea handles the actual repository mirroring and synchronization
- Access tokens should be kept secure and not committed to the repository
