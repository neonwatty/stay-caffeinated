# Development Setup Guide

This guide will help you set up your development environment for Stay Caffeinated.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Building for Production](#building-for-production)
- [Troubleshooting](#troubleshooting)
- [IDE Configuration](#ide-configuration)

## Prerequisites

### Required Software

| Software | Minimum Version | Recommended Version | Purpose |
|----------|----------------|-------------------|---------|
| Node.js | 18.0.0 | 20.0.0+ | JavaScript runtime |
| npm | 9.0.0 | 10.0.0+ | Package manager |
| Git | 2.30.0 | Latest | Version control |

### Optional Software

| Software | Purpose |
|----------|---------|
| Docker | Containerization (future) |
| VS Code | Recommended IDE |
| Chrome/Firefox | Development browsers |

### System Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Disk Space**: 2GB free space
- **Internet**: Required for initial setup

## Installation

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/yourusername/stay-caffeinated.git

# Using SSH (recommended for contributors)
git clone git@github.com:yourusername/stay-caffeinated.git

# Navigate to project directory
cd stay-caffeinated
```

### 2. Install Node.js

#### macOS (using Homebrew)
```bash
brew install node@20
```

#### Windows (using Chocolatey)
```powershell
choco install nodejs
```

#### Linux (using NodeSource)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Using NVM (Node Version Manager) - Recommended
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 20
nvm install 20
nvm use 20

# Set as default
nvm alias default 20
```

### 3. Install Dependencies

```bash
# Install all dependencies
npm install

# If you encounter issues, try cleaning cache
npm cache clean --force
npm install

# For a completely fresh install
rm -rf node_modules package-lock.json
npm install
```

### 4. Verify Installation

```bash
# Check Node.js version
node --version  # Should output v20.x.x or higher

# Check npm version
npm --version   # Should output 10.x.x or higher

# Run setup verification script
npm run verify-setup
```

## Environment Configuration

### 1. Create Environment Files

```bash
# Copy example environment file
cp .env.example .env.local

# For production builds
cp .env.production .env.production.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your settings:

```env
# Application Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Stay Caffeinated"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Development Settings
NEXT_PUBLIC_HOT_RELOAD=true
NEXT_PUBLIC_SOURCE_MAPS=true

# Optional: Analytics (if needed)
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_SENTRY_DSN=
```

### 3. SSL Configuration (Optional)

For HTTPS in development:

```bash
# Generate local SSL certificate
npm run generate-cert

# The application will now be available at https://localhost:3000
```

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# With Turbopack (faster builds)
npm run dev:turbo

# With specific port
PORT=4000 npm run dev

# With debug mode
DEBUG=* npm run dev
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm run start

# Or combine both
npm run build && npm run start
```

### Static Export

```bash
# Build as static site
npm run export

# Serve static build locally
npm run serve
```

## Development Workflow

### 1. Branch Strategy

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Create bugfix branch
git checkout -b bugfix/issue-description

# Create hotfix branch
git checkout -b hotfix/critical-fix
```

### 2. Code Style

```bash
# Run linter
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Run type checking
npm run typecheck

# Format code with Prettier
npm run format
```

### 3. Pre-commit Hooks

```bash
# Install husky (if not already installed)
npm run prepare

# Pre-commit will automatically run:
# - Linting
# - Type checking
# - Tests for changed files
```

### 4. Making Changes

1. **Write Code**: Follow TypeScript and React best practices
2. **Write Tests**: Add tests for new features
3. **Run Tests**: `npm test`
4. **Check Types**: `npm run typecheck`
5. **Lint Code**: `npm run lint`
6. **Commit**: Use conventional commits

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run specific test file
npm test -- components/game/CaffeineBar.test.tsx

# Run tests matching pattern
npm test -- --grep "caffeine"
```

### Test Structure

```
__tests__/           # Integration tests
components/
  game/
    __tests__/      # Component tests
hooks/
  __tests__/        # Hook tests
utils/
  __tests__/        # Utility tests
```

### Writing Tests

```typescript
// Example test file: ComponentName.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    render(<ComponentName onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Building for Production

### 1. Standard Build

```bash
# Create production build
npm run build:prod

# Analyze bundle size
npm run build:analyze

# Build with optimization
npm run build:optimize
```

### 2. Build Output

```
.next/              # Next.js build output
out/                # Static export output
├── _next/         # Static assets
├── index.html     # Entry point
└── ...            # Other static files
```

### 3. Optimization Checks

```bash
# Check bundle size
npm run analyze

# Run Lighthouse audit
npm run lighthouse

# Performance profiling
npm run profile
```

## Troubleshooting

### Common Issues

#### 1. Installation Failures

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Use legacy peer deps (if needed)
npm install --legacy-peer-deps
```

#### 2. Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or use different port
PORT=3001 npm run dev
```

#### 3. Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# For tests
NODE_OPTIONS="--max-old-space-size=4096" npm test
```

#### 4. TypeScript Errors

```bash
# Rebuild TypeScript
npm run typecheck -- --force

# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo
npm run typecheck
```

#### 5. Build Failures

```bash
# Clean build cache
rm -rf .next

# Fresh build
npm run build

# With verbose output
npm run build -- --debug
```

### Error Messages Reference

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOENT` | File not found | Check file paths, run `npm install` |
| `EACCES` | Permission denied | Use `sudo` (Linux/Mac) or run as admin (Windows) |
| `MODULE_NOT_FOUND` | Missing dependency | Run `npm install` or install specific package |
| `Cannot find module 'X'` | Import error | Check import paths and installed packages |
| `Type error: ...` | TypeScript error | Fix type issues or update type definitions |

## IDE Configuration

### VS Code

#### Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "dsznajder.es7-react-js-snippets",
    "christian-kohler.path-intellisense",
    "mikestead.dotenv",
    "csstools.postcss",
    "prisma.prisma"
  ]
}
```

#### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/.next": true
  }
}
```

#### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Next.js: debug server-side",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229,
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Next.js: debug client-side",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

### WebStorm/IntelliJ IDEA

1. **Install plugins**: Prettier, ESLint, Tailwind CSS
2. **Configure Node.js**: Settings → Languages & Frameworks → Node.js
3. **Enable TypeScript**: Settings → Languages & Frameworks → TypeScript
4. **Set up ESLint**: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
5. **Configure Prettier**: Settings → Languages & Frameworks → JavaScript → Prettier

## Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Learning Resources

- [Project Architecture](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT.md)

### Support

- **Discord**: [Join our community](https://discord.gg/staycaffeinated)
- **GitHub Issues**: [Report bugs](https://github.com/yourusername/stay-caffeinated/issues)
- **Discussions**: [Ask questions](https://github.com/yourusername/stay-caffeinated/discussions)

---

*Last Updated: September 2024*
*Version: 1.0.0*