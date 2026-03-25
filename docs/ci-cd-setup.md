# CI/CD Pipeline Setup Documentation

## Overview

This document describes the CI/CD pipeline configuration for the Equitas Next.js 16 + Supabase application, including GitHub Actions workflows, Vercel deployment, and health check monitoring.

## GitHub Actions Workflow

### File: `.github/workflows/ci.yml`

The CI pipeline runs on every push to `main` and all pull requests. It consists of two parallel jobs:

#### 1. Validate Job

Runs comprehensive code quality checks:

- **Linting**: ESLint validation
- **Type Checking**: TypeScript compilation
- **Unit Tests**: Test suite execution (65 tests)
- **Code Formatting**: Prettier validation
- **Production Build**: Next.js build process

**Timeout**: 30 minutes

#### 2. E2E Job

Runs end-to-end tests against local Supabase:

- Starts PostgreSQL 15.1.1.78 service on port 54322
- Initializes local Supabase instance via CLI
- Installs Playwright browsers
- Executes E2E test suite
- Uploads Playwright reports on failure

**Timeout**: 45 minutes
**Retry Logic**: 1 retry per test in CI for flaky test resilience

### Environment Variables (CI)

```yaml
NODE_VERSION: 22.x
NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY: <local-anon-key>
CI: true (set in E2E job)
```

### Trigger Conditions

- **Push**: `main` branch only
- **Pull Request**: All PRs targeting any branch

## Health Check Endpoint

### File: `app/api/health/route.ts`

Provides application health status and Supabase connectivity verification.

**Endpoint**: `GET /api/health`

**Response Format**:

```json
{
  "status": "ok" | "degraded",
  "timestamp": "2026-03-25T10:30:00.000Z",
  "database": "connected" | "disconnected"
}
```

**Status Codes**:

- `200 OK`: Application healthy, Supabase connected
- `503 Service Unavailable`: Application degraded or Supabase unreachable

**Features**:

- No authentication required
- Uses Supabase `auth.getSession()` for lightweight connectivity check
- Graceful error handling with console logging
- Safe handling of missing environment variables

**Use Cases**:

- Vercel health checks
- Load balancer probes
- Monitoring dashboard integration
- Alerting systems

## Playwright E2E Configuration

### File: `playwright.config.ts`

CI-aware test configuration with environment-specific settings.

**Key Features**:

| Setting      | Local | CI    |
| ------------ | ----- | ----- |
| Port         | 3001  | 3000  |
| Retries      | 0     | 1     |
| Server Reuse | true  | false |
| Workers      | 1     | 1     |
| Timeout      | 90s   | 90s   |

**Configuration Details**:

- Base URL: `http://localhost:{port}` (customizable via `E2E_BASE_URL`)
- Test directory: `./e2e`
- Artifacts:
  - Screenshots: on failure only
  - Videos: on failure only
  - Traces: on first retry

## Environment Configuration

### File: `.env.example`

Documents all required and optional environment variables.

**Required for Production**:

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL (public, safe for frontend)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key (public, safe for frontend)
- `SUPABASE_SERVICE_ROLE_KEY`: Private key for server-side operations (secret)

**Local Development** (optional, commented in example):

- Localhost Supabase instance configuration
- Uses port 54321 by default

## Vercel Deployment Configuration

### File: `vercel.json`

Platform-specific deployment settings for Vercel.

**Configuration**:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  },
  "git": {
    "deploymentEnabled": {
      "main": true
    }
  }
}
```

**Environment Variable References**:

- Using `@variable-name` syntax securely references secrets stored in Vercel dashboard
- Secrets must be set in Vercel project settings
- Never commit actual secret values

**Deployment Behavior**:

- Auto-deploy enabled for `main` branch
- Preview deployments for all PRs (if configured in Vercel dashboard)

## Workflow Diagram

```
Developer Push to main or Create PR
          ↓
   GitHub Actions Triggered
          ↓
   ┌─────┴─────┐
   ↓           ↓
Validate Job  E2E Job
(30 min)      (45 min)
   ↓           ↓
  Lint      Supabase
   ↓         Setup
TypeCheck    ↓
   ↓      Playwright
 Test       Install
   ↓          ↓
Format      E2E Tests
   ↓          ↓
 Build     Report
   ↓          ↓
   └─────┬─────┘
         ↓
  All Passed?
     ↙        ↘
   Yes        No
    ↓          ↓
  ✓ OK    Notify Developer
    ↓
Deploy to Vercel
    ↓
Health Check: /api/health
```

## Setup Instructions

### For New Team Members

1. **Clone and setup**:

   ```bash
   git clone <repo>
   cd equitas
   npm ci
   ```

2. **Local environment**:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Cloud Supabase credentials
   ```

3. **Run locally**:
   ```bash
   npm run dev                  # Start Next.js dev server
   npm run test:e2e:headed      # Run E2E tests with browser
   npm run check                # Run all checks (same as CI)
   ```

### For Repository Maintainers

1. **GitHub Setup**:
   - Repository already has `.github/workflows/ci.yml`
   - Actions run automatically on push/PR

2. **Vercel Setup**:
   - Link repository to Vercel project (ID: `prj_gSqXnKSnyQZyHCQkrSca6Lh1l1e7`)
   - Set environment secrets in Vercel dashboard:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Enable auto-deployment on main branch

## Troubleshooting

### E2E Tests Fail in CI

**Check**:

1. Supabase migrations applied: `supabase status --workdir ./supabase`
2. Port 54322 availability
3. Database schema matches expectations
4. Playwright browser compatibility

**Debug**:

```bash
# Download artifacts from failed GitHub Actions run
# Check playwright-report/ directory for screenshots/videos
```

### Health Endpoint Returns 503

**Check**:

1. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
2. Supabase Cloud instance operational
3. Network connectivity from deployment region
4. Check application logs for errors

### Vercel Deployment Fails

**Check**:

1. Build command succeeds locally: `npm run build`
2. All environment variables set in Vercel dashboard
3. Node 22.x selected in Vercel project settings
4. Check Vercel build logs for detailed errors

## Performance Optimization

### Cache Strategy

- NPM dependencies cached in GitHub Actions
- Next.js build cache preserved between runs
- Playwright cache for browser binaries

### Parallel Execution

- Validate and E2E jobs run simultaneously
- Reduces total CI time

### Selective Testing

- Consider adding test path filters for feature branches
- Implement scheduled runs for heavy E2E suites

## Security Best Practices

✓ **Never commit secrets**:

- Service role keys stored in platform secrets only
- Public keys in `.env.example` as documentation

✓ **Environment isolation**:

- Local Supabase for CI E2E tests
- Separate Cloud instance for production

✓ **Access control**:

- Health endpoint has no authentication (intentional for probes)
- Service role key restricted to server-side operations

## Maintenance Schedule

| Task                      | Frequency | Owner    |
| ------------------------- | --------- | -------- |
| Update Node version       | Annually  | DevOps   |
| Review Playwright version | Quarterly | QA Lead  |
| Audit dependencies        | Monthly   | Security |
| Test health endpoint      | Weekly    | On-call  |

## References

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Playwright Testing](https://playwright.dev)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Supabase CLI](https://supabase.com/docs/reference/cli)
