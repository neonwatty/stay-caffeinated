# Deployment Guide - Stay Caffeinated

## Static Export Configuration

The project is configured for static export to GitHub Pages with the following setup:

### Configuration Files

1. **next.config.ts**
   - `output: "export"` - Enables static HTML export
   - `basePath: "/stay-caffeinated"` - Sets the base path for GitHub Pages (production only)
   - `images.unoptimized: true` - Required for static export

2. **.github/workflows/deploy.yml**
   - Automated deployment workflow
   - Triggers on push to `main` branch
   - Builds and deploys to GitHub Pages

3. **package.json scripts**
   - `npm run build` - Builds the static export
   - `npm run serve` - Serves the static files locally for testing

## Deployment Steps

### Automatic Deployment (GitHub Actions)

1. Push changes to the `main` branch
2. GitHub Actions will automatically:
   - Build the Next.js application
   - Export static files to the `out` directory
   - Deploy to GitHub Pages

### Manual Deployment

1. Build the static export:
   ```bash
   npm run build
   ```

2. Test locally:
   ```bash
   npm run serve
   ```
   Visit http://localhost:3000 to verify

3. The `out` directory contains all static files ready for deployment

## GitHub Pages Setup

1. Go to your repository Settings → Pages
2. Under "Build and deployment":
   - Source: GitHub Actions
3. The site will be available at:
   ```
   https://[username].github.io/stay-caffeinated
   ```

## Important Notes

- The `.nojekyll` file in `public/` prevents GitHub Pages from processing files
- All paths are relative due to the basePath configuration
- API routes are not supported in static export
- Dynamic routes must use `getStaticPaths`

## Troubleshooting

### Build Failures
- Ensure all dependencies are installed: `npm ci`
- Check for any API route usage (not supported)
- Verify all dynamic imports are client-side only

### 404 Errors on GitHub Pages
- Verify the basePath is correctly set in next.config.ts
- Ensure the repository name matches the basePath
- Check that GitHub Pages is enabled in repository settings

### Assets Not Loading
- Confirm all asset paths are relative
- Check that images have `unoptimized: true` in config
- Verify public files are correctly copied to `out` directory