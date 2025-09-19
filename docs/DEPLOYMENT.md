# Deployment & DevOps Guide

## Overview

Stay Caffeinated uses a comprehensive CI/CD pipeline with automated deployment to GitHub Pages. The deployment process includes quality gates, testing, and performance optimization.

## 🚀 Deployment Pipeline

### Workflows

1. **CI/CD Pipeline** (`.github/workflows/ci.yml`)
   - Runs on every push and PR
   - Quality checks (linting, type checking, tests)
   - Security scanning
   - Build verification
   - Performance analysis

2. **Deployment** (`.github/workflows/deploy.yml`)
   - Deploys to GitHub Pages
   - Only runs after successful CI
   - Includes test execution before deployment

## 📋 Quality Gates

All deployments must pass the following quality gates:

- ✅ **Linting** - Code style and quality checks
- ✅ **Type Checking** - TypeScript compilation
- ✅ **Unit Tests** - All tests must pass (637+ tests)
- ✅ **Security Audit** - No high/critical vulnerabilities
- ✅ **Build Verification** - Successful production build
- ✅ **Performance Budget** - Bundle size under limits

## 🔧 Environment Configuration

### Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Available environment variables:
- `NODE_ENV` - Development/production mode
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_ENABLE_PWA` - Enable Progressive Web App features
- `NEXT_PUBLIC_ENABLE_ANALYTICS` - Enable analytics tracking

### GitHub Secrets

Required secrets for deployment (set in GitHub repository settings):
- None required for GitHub Pages deployment (uses GITHUB_TOKEN automatically)

## 🛠️ Local Development

### Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Build with optimization
npm run build:optimize

# Serve production build locally
npm run serve
```

### Testing Deployment Locally

```bash
# Build the application
npm run build

# Optimize the build
node scripts/optimize-build.js

# Serve the static files
npm run serve
```

## 📦 Build Optimization

The build optimization script (`scripts/optimize-build.js`) performs:

1. **Build Analysis** - Analyzes bundle sizes
2. **Image Optimization** - Optimizes images (if sharp is installed)
3. **Service Worker Creation** - Generates PWA service worker
4. **Manifest Generation** - Creates build manifest with metadata
5. **Performance Budget Check** - Validates against size limits

### Performance Budgets

- Total build size: < 5MB
- JavaScript bundle: < 500KB
- CSS bundle: < 100KB

### Running Optimization

```bash
npm run build:optimize
```

This will generate:
- Optimized build in `/out` directory
- Build report in `build-report.json`
- Service worker at `/out/sw.js`

## 🚢 Manual Deployment

### Deploy to GitHub Pages

1. Ensure you're on the `main` branch
2. Push changes to trigger automatic deployment:
   ```bash
   git push origin main
   ```

3. Monitor deployment:
   - Check Actions tab in GitHub repository
   - Wait for CI/CD Pipeline to complete
   - Deployment will start automatically if CI passes

### Deploy Preview for PRs

Pull requests automatically generate preview builds:
1. Create PR against `main` branch
2. CI/CD pipeline runs all checks
3. Build artifacts are available for review
4. Comment is added to PR with status

## 📊 Monitoring

### Build Status

Check the GitHub Actions tab for:
- CI/CD Pipeline status
- Deployment status
- Test results
- Coverage reports

### Performance Metrics

After deployment, check:
- Build size report in artifacts
- Bundle analysis (when enabled)
- Performance budget compliance

## 🔄 Rollback

To rollback a deployment:

1. **Via GitHub UI:**
   - Go to Actions > Deploy to GitHub Pages
   - Click "Run workflow"
   - Select previous commit/tag

2. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   ```

## 🛡️ Security

- Dependencies are automatically audited in CI
- Security vulnerabilities block deployment
- Use `npm audit fix` to resolve issues
- Critical updates should be applied immediately

## 📝 Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node version (should be 20+)
   - Clear cache: `rm -rf .next out`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

2. **Tests Fail**
   - Run tests locally: `npm test`
   - Check for flaky tests
   - Ensure mocks are properly configured

3. **Deployment Fails**
   - Check GitHub Pages settings
   - Verify permissions in repository settings
   - Check workflow logs for specific errors

4. **Performance Budget Exceeded**
   - Run bundle analyzer: `npm run analyze`
   - Check for large dependencies
   - Enable code splitting where possible

## 📚 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Pages Documentation](https://docs.github.com/pages)